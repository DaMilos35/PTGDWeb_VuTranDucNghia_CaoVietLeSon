import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import fakeApi from "../database/fakeApi";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("handmeon_logged_user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [chats, setChats] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalCategory, setGlobalCategory] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [miniChatId, setMiniChatId] = useState(null);
  const [miniChatOpen, setMiniChatOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);
  const [searchState, setSearchState] = useState({ query: "", filters: { condition: [], format: [], minPrice: "", maxPrice: "", category: [], location: "", brand: [], rating: "" }, sortBy: "relevance" });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("handmeon_dark_mode") === "true";
    }
    return false;
  });
  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("handmeon_primary_color") || "#6C63FF";
    }
    return "#6C63FF";
  });
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("handmeon_language") || "vi";
    }
    return "vi";
  });

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("handmeon_dark_mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    localStorage.setItem("handmeon_primary_color", primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem("handmeon_language", language);
  }, [language]);

  const toggleDarkMode = useCallback(() => setDarkMode(d => !d), []);

  const refreshedUserRef = useRef(null);

  // Load cart & watchlist from server/localStorage on mount or user change
  useEffect(() => {
    fakeApi.getCart(user?.id).then(setCartItems);
    fakeApi.getWatchlist(user?.id).then(setWatchedIds);
    if (user) fakeApi.getChatsForUser(user.id).then(setChats);
    else setChats([]);
    
    // Refresh user data once per userId (avoid infinite loop)
    if (user && user.id && refreshedUserRef.current !== user.id) {
      refreshedUserRef.current = user.id;
      fakeApi.getUserById(user.id)
        .then(freshUser => {
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem("handmeon_logged_user", JSON.stringify(freshUser));
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      fakeApi.getNotifications(user.id).then(notifs => {
        setNotifCount(notifs.filter(n => !n.read).length);
      });
    } else {
      setNotifCount(0);
    }
  }, [user]);

  // Load system settings
  useEffect(() => {
    fakeApi.getSystemSettings().then(setSystemSettings).catch(() => {});
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const handleAddToCart = useCallback(async (product) => {
    const updated = await fakeApi.addToCart(product, user?.id);
    setCartItems(updated);
    showToast("Đã thêm vào giỏ hàng! 🛒");
  }, [user?.id, showToast]);

  const handleRemoveFromCart = useCallback(async (id) => {
    const updated = await fakeApi.removeFromCart(id, user?.id);
    setCartItems(updated);
  }, [user?.id]);

  const handleClearCart = useCallback(async () => {
    const updated = await fakeApi.clearCart(user?.id);
    setCartItems(updated);
  }, [user?.id]);

  const handleWatch = useCallback(async (id) => {
    const updated = await fakeApi.toggleWatchlist(id, user?.id);
    setWatchedIds([...updated]);
    
    // Update local user object if logged in
    if (user) {
      const updatedUser = { ...user, watchlist: updated };
      setUser(updatedUser);
      localStorage.setItem("handmeon_logged_user", JSON.stringify(updatedUser));
    }

    const isWatched = updated.includes(id);
    showToast(isWatched ? "Đã lưu vào yêu thích ❤️" : "Đã xóa khỏi yêu thích");
  }, [user, showToast]);

  const handleLogin = useCallback((u) => {
    setUser(u);
    localStorage.setItem("handmeon_logged_user", JSON.stringify(u));
    fakeApi.getNotifications(u.id).then(notifs => {
      setNotifCount(notifs.filter(n => !n.read).length);
    });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("handmeon_logged_user");
    setNotifCount(0);
    setView("auth");
    showToast("Đã đăng xuất thành công");
  }, [showToast]);

  const handleUpdateProfile = useCallback(async (data) => {
    if (!user) return;
    const updated = await fakeApi.updateProfile(user.id, data);
    setUser(updated);
    localStorage.setItem("handmeon_logged_user", JSON.stringify(updated));
    showToast("Đã cập nhật hồ sơ! ✅");
    return updated;
  }, [user, showToast]);

  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback(async (v, payload = null) => {
    if (v === "product" && payload) setSelectedProduct(payload);
    if (v === "store" && payload) {
      // If payload only has ID or is partial, fetch full
      if (payload.id && (!payload.bio || !payload.joined)) {
        try {
          const full = await fakeApi.getUserById(payload.id);
          setSelectedUser(full);
          payload = full;
        } catch (e) {
          setSelectedUser(payload);
        }
      } else {
        setSelectedUser(payload);
      }
    }
    if (v === "messaging" && payload) setActiveChatId(payload);
    
    setViewData(payload);
    window.scrollTo({ top: 0, behavior: "smooth" });

    let path = `/${v}`;
    if (v === "home") path = "/";
    if (v === "product" && payload?.id) path = `/product/${payload.id}`;
    if (v === "store" && payload?.id) path = `/store/${payload.id}`;
    
    navigate(path, { state: { payload } });
  }, [navigate]);

  // Derive view from location.pathname for backward compatibility
  const view = location.pathname === "/" ? "home" : location.pathname.split("/")[1];



  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("handmeon_logged_user", JSON.stringify(updatedUser));
    if (updatedUser.id) fakeApi.updateUser(updatedUser.id, updatedUser).catch(() => {});
  }, []);

  return (
    <AppContext.Provider value={{
      view, setView: navigateTo,
      user, handleLogin, handleLogout, handleUpdateProfile, handleUpdateUser,
      selectedProduct, setSelectedProduct,
      selectedUser, setSelectedUser,
      cartItems, handleAddToCart, handleRemoveFromCart, handleClearCart,
      watchedIds, handleWatch,
      toasts, showToast, dismissToast,
      notifCount, setNotifCount,
      globalSearch, setGlobalSearch,
      globalCategory, setGlobalCategory,
      activeChatId, setActiveChatId,
      miniChatId, setMiniChatId,
      miniChatOpen, setMiniChatOpen,
      cartDrawerOpen, setCartDrawerOpen,
      darkMode, toggleDarkMode,
      primaryColor, setPrimaryColor,
      language, setLanguage,
      searchState, setSearchState,
      viewData, setViewData,
      chats, setChats,
      systemSettings, setSystemSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp phải được dùng trong AppProvider");
  return ctx;
};
