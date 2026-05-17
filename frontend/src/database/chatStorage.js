// Chat storage using IndexedDB
// Ensures messages and files are stored strictly locally on the user's device
// Admin and Backend cannot access these messages.

const DB_NAME = 'HandMeOnChatDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveMessageLocal = async (msg) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(msg);
    tx.oncomplete = () => resolve(msg);
    tx.onerror = () => reject(tx.error);
  });
};

export const getMessagesLocal = async (chatId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const allMsgs = request.result;
      if (chatId) {
        const filtered = allMsgs.filter(m => m.chatId === chatId);
        resolve(filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      } else {
        resolve(allMsgs); // Used for getting all chats
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const getChatListLocal = async (userId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const allMsgs = request.result;
      // Extract unique chats for this user
      const chats = {};
      allMsgs.forEach(msg => {
        if (msg.chatId.includes(userId)) {
          if (!chats[msg.chatId] || new Date(msg.timestamp) > new Date(chats[msg.chatId].lastMessageTime)) {
            chats[msg.chatId] = {
              id: msg.chatId,
              lastMessage: msg.text || (msg.type === 'image' ? '[Hình ảnh]' : '[Tin nhắn]'),
              lastMessageTime: msg.timestamp,
              unreadCount: allMsgs.filter(m => m.chatId === msg.chatId && m.senderId !== userId && !m.read).length
            };
          }
        }
      });
      resolve(Object.values(chats));
    };
    request.onerror = () => reject(request.error);
  });
};

export const markAsReadLocal = async (chatId, userId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const msgs = request.result.filter(m => m.chatId === chatId && m.senderId !== userId && !m.read);
      msgs.forEach(m => {
        m.read = true;
        store.put(m);
      });
      resolve(true);
    };
    request.onerror = () => reject(request.error);
  });
};
