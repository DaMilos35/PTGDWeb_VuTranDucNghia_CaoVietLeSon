import React, { Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

// Standard synchronous imports for core layout
import { useApp, AppProvider } from "./context/AppContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AIChatbot from "./components/common/AIChatbot";
import MiniChat from "./components/common/MiniChat";
import CartDrawer from "./components/common/CartDrawer";
import Spinner from "./components/common/Spinner";
import { DS } from "./design/tokens";

// Lazy Loaded Pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const SearchPage = React.lazy(() => import("./pages/SearchPage"));
const ProductDetailPage = React.lazy(() => import("./pages/ProductDetailPage"));
const CreateListingPage = React.lazy(() => import("./pages/CreateListingPage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const OrdersPage = React.lazy(() => import("./pages/OrdersPage"));
const MessagingPage = React.lazy(() => import("./pages/MessagingPage"));
const WatchlistPage = React.lazy(() => import("./pages/WatchlistPage"));
const CartPage = React.lazy(() => import("./pages/CartPage"));
const CheckoutPage = React.lazy(() => import("./pages/CheckoutPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const UserHubPage = React.lazy(() => import("./pages/UserHubPage"));
const AdminPage = React.lazy(() => import("./pages/AdminPage"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const FlashSalePage = React.lazy(() => import("./pages/FlashSalePage"));
const LeaderboardPage = React.lazy(() => import("./pages/LeaderboardPage"));
const StorePage = React.lazy(() => import("./pages/StorePage"));
const CoinsPage = React.lazy(() => import("./pages/CoinsPage"));
const SustainabilityPage = React.lazy(() => import("./pages/SustainabilityPage"));
const HelpCenterPage = React.lazy(() => import("./pages/HelpCenterPage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));

const TOAST_ICONS = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };

function ToastManager() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type || "success"}`}
          onClick={() => dismissToast(t.id)}
          title="Nhấn để đóng"
          style={{ cursor: "pointer" }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>{TOAST_ICONS[t.type || "success"]}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <span style={{ opacity: 0.6, fontSize: 12, flexShrink: 0 }}>✕</span>
        </div>
      ))}
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// Wow Effect: PageWrapper
function PageWrapper({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

// Fallback Loader
function PageLoader() {
  return (
    <div style={{ height: "calc(100vh - 200px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 60, height: 60, borderRadius: "20px", background: DS.gradientPrimary,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, boxShadow: "0 10px 25px rgba(239,68,68,0.3)", animation: "pulse 1.5s infinite"
      }}>🛍️</div>
      <p style={{ marginTop: 20, color: DS.textSecondary, fontWeight: 600, animation: "pulse 2s infinite" }}>Đang chuẩn bị không gian...</p>
    </div>
  );
}

function AppContent() {
  const { view, user, miniChatOpen, systemSettings } = useApp();
  const showMiniChat = miniChatOpen && view !== "messaging";

  const protectedViews = ["dashboard", "orders", "listing", "messaging", "profile", "checkout", "coins", "settings", "watchlist", "notifications"];
  const currentView = protectedViews.includes(view) && !user ? "auth" : view;

  const pages = {
    home: <HomePage />,
    search: <SearchPage />,
    product: <ProductDetailPage />,
    listing: <CreateListingPage />,
    dashboard: <DashboardPage />,
    orders: <OrdersPage />,
    messaging: <MessagingPage />,
    watchlist: <WatchlistPage />,
    cart: <CartPage />,
    checkout: <CheckoutPage />,
    profile: <UserHubPage />,
    admin: <AdminPage />,
    auth: <AuthPage />,
    flashsale: <FlashSalePage />,
    leaderboard: <LeaderboardPage />,
    store: <StorePage />,
    coins: <CoinsPage />,
    sustainability: <SustainabilityPage />,
    help: <HelpCenterPage />,
    settings: <SettingsPage />,
  };

  const noHeader = ["admin"];
  const noFooter = ["messaging", "auth", "checkout", "admin"];

  const hideHeader = noHeader.includes(view);
  const hideFooter = noFooter.includes(view);

  if (systemSettings?.maintenanceMode && view !== "admin" && user?.role !== "admin") {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
        <h1 style={{ fontSize: 60 }}>🛠️</h1>
        <h2 style={{ fontSize: 32, fontWeight: 900 }}>Hệ thống đang bảo trì</h2>
        <p style={{ color: DS.textMuted, maxWidth: 500, marginTop: 16 }}>{systemSettings.maintenanceMessage || "Chúng tôi sẽ quay trở lại sớm. Cảm ơn bạn đã kiên nhẫn!"}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif", background: "#F8FAFC", minHeight: "100vh", overflowX: "hidden" }}>
      {systemSettings?.globalAnnouncement && !hideHeader && (
        <div style={{ background: DS.primary, color: "#fff", padding: "8px 20px", textAlign: "center", fontSize: 13, fontWeight: 700, animation: "fadeIn 0.5s ease" }}>
          📢 {systemSettings.globalAnnouncement}
        </div>
      )}
      {!hideHeader && <Header />}
      <main style={{ minHeight: !hideHeader ? "calc(100vh - 66px)" : "100vh" }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><SearchPage /></PageWrapper>} />
            <Route path="/product/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
            <Route path="/product" element={<PageWrapper><ProductDetailPage /></PageWrapper>} /> {/* Fallback */}
            <Route path="/listing" element={<RequireAuth><PageWrapper><CreateListingPage /></PageWrapper></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><PageWrapper><DashboardPage /></PageWrapper></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><PageWrapper><OrdersPage /></PageWrapper></RequireAuth>} />
            <Route path="/messaging/*" element={<RequireAuth><PageWrapper><MessagingPage /></PageWrapper></RequireAuth>} />
            <Route path="/watchlist" element={<RequireAuth><PageWrapper><WatchlistPage /></PageWrapper></RequireAuth>} />
            <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
            <Route path="/checkout" element={<RequireAuth><PageWrapper><CheckoutPage /></PageWrapper></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><PageWrapper><UserHubPage /></PageWrapper></RequireAuth>} />
            <Route path="/admin/*" element={<RequireAuth><PageWrapper><AdminPage /></PageWrapper></RequireAuth>} />
            <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
            <Route path="/flashsale" element={<PageWrapper><FlashSalePage /></PageWrapper>} />
            <Route path="/leaderboard" element={<PageWrapper><LeaderboardPage /></PageWrapper>} />
            <Route path="/store/:id" element={<PageWrapper><StorePage /></PageWrapper>} />
            <Route path="/store" element={<PageWrapper><StorePage /></PageWrapper>} /> {/* Fallback */}
            <Route path="/coins" element={<RequireAuth><PageWrapper><CoinsPage /></PageWrapper></RequireAuth>} />
            <Route path="/sustainability" element={<PageWrapper><SustainabilityPage /></PageWrapper>} />
            <Route path="/help" element={<PageWrapper><HelpCenterPage /></PageWrapper>} />
            <Route path="/settings" element={<RequireAuth><PageWrapper><SettingsPage /></PageWrapper></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><PageWrapper><NotificationsPage /></PageWrapper></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      <AIChatbot />
      {showMiniChat && <MiniChat />}
      <CartDrawer />
      <ToastManager />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
