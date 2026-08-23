import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense, CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { CompareProvider } from "@/contexts/CompareContext";
import { CompareBar } from "@/components/CompareBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";

// Kick off downloads immediately — before React even renders — so they're
// ready (or nearly ready) by the time Suspense asks for them.
const _home         = import("@/pages/Home");
const _shop         = import("@/pages/Shop");
const _product      = import("@/pages/ProductDetails");
const _cart         = import("@/pages/Cart");
const _iphones      = import("@/pages/Iphones");
const _laptops      = import("@/pages/Laptops");
const _electronics  = import("@/pages/Electronics");
const _homeKitchen  = import("@/pages/HomeKitchen");
const _audio        = import("@/pages/Audio");
const _tools        = import("@/pages/ToolsHomeImprovement");
const _gaming       = import("@/pages/Gaming");
const _deals        = import("@/pages/Deals");
const _checkout     = import("@/pages/Checkout");
const _trackOrder   = import("@/pages/TrackOrder");
const _myOrders     = import("@/pages/MyOrders");
const _orderLookup  = import("@/pages/OrderLookup");
const _about        = import("@/pages/About");
const _contact      = import("@/pages/Contact");
const _blog         = import("@/pages/Blog");
const _adminLogin   = import("@/pages/AdminLogin");
const _adminDash    = import("@/pages/AdminDashboard");
const _customerLogin = import("@/pages/CustomerLogin");
const _customerReg   = import("@/pages/CustomerRegister");
const _notFound     = import("@/pages/not-found");

const Home                = lazy(() => _home);
const Shop                = lazy(() => _shop);
const Iphones             = lazy(() => _iphones);
const Laptops             = lazy(() => _laptops);
const Electronics         = lazy(() => _electronics);
const HomeKitchen         = lazy(() => _homeKitchen);
const Audio               = lazy(() => _audio);
const ToolsHomeImprovement = lazy(() => _tools);
const Gaming              = lazy(() => _gaming);
const Deals               = lazy(() => _deals);
const ProductDetails      = lazy(() => _product);
const Cart                = lazy(() => _cart);
const Checkout            = lazy(() => _checkout);
const TrackOrder          = lazy(() => _trackOrder);
const MyOrders            = lazy(() => _myOrders);
const OrderLookup         = lazy(() => _orderLookup);
const About               = lazy(() => _about);
const Contact             = lazy(() => _contact);
const Blog                = lazy(() => _blog);
const AdminLogin          = lazy(() => _adminLogin);
const AdminDashboard      = lazy(() => _adminDash);
const CustomerLogin       = lazy(() => _customerLogin);
const CustomerRegister    = lazy(() => _customerReg);
const NotFound            = lazy(() => _notFound);

const BASE_URL = 'https://dopikelectronics.com';
const NO_INDEX_PREFIXES = ['/cart', '/checkout', '/track-order', '/my-orders', '/orders', '/admin'];

/* ── Skeleton: mirrors index.html exactly so swap is seamless ── */
const SK: CSSProperties = {
  borderRadius: 6,
  animation: "sk-shimmer 1.4s infinite linear",
};

function SkBlock({ style }: { style?: CSSProperties }) {
  const isDark = document.documentElement.classList.contains("dark");
  return (
    <div style={{
      ...SK,
      background: isDark
        ? "linear-gradient(90deg,#1f2229 25%,#2a2d38 50%,#1f2229 75%)"
        : "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
      backgroundSize: "600px 100%",
      ...style,
    }} />
  );
}

function PageSkeleton() {
  const isDark = document.documentElement.classList.contains("dark");
  const bg = isDark ? "#16181d" : "#ffffff";
  const navBg = isDark ? "#1f2229" : "#ffffff";
  const navBorder = isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e7eb";
  const brandColor = isDark ? "#f5f5f5" : "#0a1628";
  const searchBg = isDark ? "#2a2d38" : "#f3f4f6";

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center",
        padding: "0 24px", gap: 16,
        background: navBg, borderBottom: navBorder,
      }}>
        <img src="/dopik-logo.png" alt="Dopik" style={{ height: 36, width: 36, objectFit: "contain", flexShrink: 0 }} />
        <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.2em", flexShrink: 0, color: brandColor }}>DOPIK</span>
        <div style={{ flex: 1, maxWidth: 480, height: 38, borderRadius: 20, background: searchBg, margin: "0 auto" }} />
        <SkBlock style={{ width: 64, height: 20, borderRadius: 10, flexShrink: 0 }} />
        <SkBlock style={{ width: 64, height: 20, borderRadius: 10, flexShrink: 0 }} />
      </nav>
      {/* Content */}
      <main style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto" }}>
        <SkBlock style={{ width: "100%", height: 320, borderRadius: 16, marginBottom: 40 }} />
        <div style={{ display: "flex", gap: 12, marginBottom: 40, overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <SkBlock key={i} style={{ width: 90, height: 36, borderRadius: 18, flexShrink: 0 }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden" }}>
              <SkBlock style={{ width: "100%", height: 160 }} />
              <div style={{ padding: 12 }}>
                <SkBlock style={{ height: 14, marginBottom: 8, width: "80%" }} />
                <SkBlock style={{ height: 18, width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function GlobalSeo() {
  const [path] = useLocation();
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const canonical = `${BASE_URL}${cleanPath}`;
  const noIndex = NO_INDEX_PREFIXES.some(p => cleanPath.startsWith(p));
  return (
    <Helmet>
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noIndex ? 'noindex, follow' : 'index, follow'} />
    </Helmet>
  );
}

function VisitorTracker() {
  const [location] = useLocation();

  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("visitor_id", visitorId);
    }

    apiRequest("POST", "/api/track-visitor", {
      visitorId,
      path: location
    }).catch(err => console.error("Tracking failed", err));
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <GlobalSeo />
      <VisitorTracker />
      <Suspense fallback={<PageSkeleton />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/products" component={Shop} />
          <Route path="/iphones" component={Iphones} />
          <Route path="/laptops" component={Laptops} />
          <Route path="/electronics" component={Electronics} />
          <Route path="/home-kitchen" component={HomeKitchen} />
          <Route path="/audio" component={Audio} />
          <Route path="/tools-home-improvement" component={ToolsHomeImprovement} />
          <Route path="/gaming" component={Gaming} />
          <Route path="/smartphones" component={() => <Shop category="Smartphones" />} />
          <Route path="/tablets" component={() => <Shop category="Tablets" />} />
          <Route path="/smartwatches" component={() => <Shop category="Smartwatches" />} />
          <Route path="/deals" component={Deals} />
          <Route path="/product/:id" component={ProductDetails} />
          <Route path="/product/slug/:slug" component={ProductDetails} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout/shipping" component={Checkout} />
          <Route path="/checkout/payment" component={Checkout} />
          <Route path="/order/success" component={Checkout} />
          <Route path="/order-success" component={Checkout} />
          <Route path="/track-order" component={TrackOrder} />
          <Route path="/my-orders" component={MyOrders} />
          <Route path="/orders/lookup" component={OrderLookup} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/blog" component={Blog} />
          <Route path="/login" component={CustomerLogin} />
          <Route path="/register" component={CustomerRegister} />
          <Route path="/xdopik-portal" component={AdminLogin} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CompareProvider>
          <Toaster />
          <div className="pb-16 lg:pb-0">
            <Router />
          </div>
          <CompareBar />
          <MobileBottomNav />
        </CompareProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
