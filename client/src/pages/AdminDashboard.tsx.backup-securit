import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  History,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Monitor,
  Star,
  Flame,
  ChevronRight,
  Zap,
  Eye,
  BarChart3,
  Layers,
  LogOut,
  Bell,
  Search,
  RefreshCw,
  Film,
  Sparkles,
  Tag,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AdminProducts from "./AdminProducts";
import AdminAddProduct from "./AdminAddProduct";
import AdminEditProduct from "./AdminEditProduct";
import AdminOrders from "./AdminOrders";
import AdminAuditLog from "./AdminAuditLog";
import AdminSettings from "./admin/AdminSettings";
import UserManagement from "./admin/UserManagement";
import AdminHomeSections from "./AdminHomeSections";
import AdminReviews from "./AdminReviews";
import AdminHotDeals from "./AdminHotDeals";
import AdminVideos from "./AdminVideos";
import AdminFeaturedSlides from "./AdminFeaturedSlides";
import AdminCoupons from "./AdminCoupons";
import AdminCustomers from "./AdminCustomers";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(v);

const MENU = [
  {
    group: "Overview",
    items: [{ id: "Dashboard", icon: LayoutDashboard, label: "Dashboard", color: "text-violet-400" }],
  },
  {
    group: "Management",
    items: [
      { id: "Products", icon: Package, label: "Products", color: "text-blue-400" },
      { id: "Orders", icon: ShoppingCart, label: "Orders", color: "text-orange-400" },
      { id: "Reviews", icon: Star, label: "Reviews", color: "text-yellow-400", badge: true },
      { id: "Hot Deals", icon: Flame, label: "Today's Top Deals", color: "text-red-400" },
      { id: "Home Sections", icon: Layers, label: "Home Sections", color: "text-emerald-400" },
      { id: "Videos", icon: Film, label: "Promo Videos", color: "text-purple-400" },
      { id: "Featured Slides", icon: Sparkles, label: "Featured Slides", color: "text-yellow-400" },
      { id: "Coupons", icon: Tag, label: "Coupon Codes", color: "text-pink-400" },
      { id: "Customers", icon: Users, label: "Customers", color: "text-teal-400" },
      { id: "Users", icon: Users, label: "Users", color: "text-cyan-400" },
    ],
  },
  {
    group: "System",
    items: [
      { id: "Audit Log", icon: History, label: "Audit Log", color: "text-slate-400" },
      { id: "Settings", icon: Settings, label: "Settings", color: "text-slate-400" },
    ],
  },
];

function StatCard({ title, value, icon: Icon, sub, accent, onClick, trend }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 md:p-5 transition-all duration-300 shadow-sm",
        onClick && "cursor-pointer hover:shadow-md hover:border-gray-300",
      )}
    >
      <div className={cn("absolute -top-4 -right-4 h-20 w-20 rounded-full opacity-10 blur-xl", accent)} />
      <div className="flex items-start justify-between mb-3">
        <div className={cn("inline-flex rounded-xl p-2.5 bg-gray-100", accent.replace("bg-", "text-"))}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && (
          <span className={cn("text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full", trend >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500")}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{title}</p>
      <h3 className="text-lg md:text-2xl font-black tracking-tighter text-gray-900 truncate">{value}</h3>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
      {onClick && <ChevronRight className="absolute right-3 bottom-3 h-3 w-3 text-gray-300" />}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name === "revenue" ? fmt(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [subView, setSubView] = useState<"list" | "add" | "edit">("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<"today" | "7days" | "30days" | "lifetime">("30days");
  const [collapsed, setCollapsed] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.remove("dark");
    return () => { if (wasDark) html.classList.add("dark"); };
  }, []);

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/stats?timeRange=${timeRange}`);
      return res.json();
    },
  });

  const { data: dash } = useQuery<any>({
    queryKey: ["/api/admin/dashboard", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/dashboard?timeRange=${timeRange}`);
      return res.json();
    },
  });

  const { data: reviewsRes } = useQuery<any>({
    queryKey: ["/api/admin/reviews", "pending-count"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reviews?status=pending", { credentials: "include" });
      return res.json();
    },
    refetchInterval: 30000,
  });
  const pendingReviews = reviewsRes?.pendingCount || 0;

  const handleLogout = async () => {
    await apiRequest("POST", "/api/admin/logout", {});
    queryClient.clear();
    navigate("/admin/login");
  };

  const statCards = [
    { title: "Revenue", value: fmt(stats?.totalRevenue || 0), icon: DollarSign, accent: "bg-violet-500 text-violet-400", trend: stats?.trends?.revenue, onClick: () => setActiveTab("Orders") },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, accent: "bg-orange-500 text-orange-400", trend: stats?.trends?.orders, onClick: () => setActiveTab("Orders") },
    { title: "Paid Orders", value: stats?.paidOrders || 0, icon: CheckCircle2, accent: "bg-emerald-500 text-emerald-400", sub: "Fulfilled", onClick: () => setActiveTab("Orders") },
    { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock, accent: "bg-amber-500 text-amber-400", trend: stats?.trends?.pending, onClick: () => setActiveTab("Orders") },
    { title: "Total Visitors", value: stats?.totalVisitors || 0, icon: Eye, accent: "bg-blue-500 text-blue-400", trend: stats?.trends?.visitors },
    { title: "Unique Visitors", value: stats?.uniqueVisitors || 0, icon: Monitor, accent: "bg-cyan-500 text-cyan-400" },
  ];

  const quickActions = [
    { label: "Add Product", icon: Package, action: () => { setActiveTab("Products"); setSubView("add"); } },
    { label: "View Orders", icon: ShoppingCart, action: () => setActiveTab("Orders") },
    { label: "Hot Deals", icon: Flame, action: () => setActiveTab("Hot Deals") },
    { label: "Home Sections", icon: Layers, action: () => setActiveTab("Home Sections") },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">

      {/* Sidebar */}
      <div className={cn(
        "relative hidden md:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out shrink-0 shadow-sm",
        collapsed ? "w-[64px]" : "w-[220px]"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-black text-gray-900 tracking-tighter">DOPIK</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-300 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
          {MENU.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">{group.group}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSubView("list"); }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : item.color)} />
                      {!collapsed && (
                        <span className="text-xs font-bold flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && (item as any).badge && pendingReviews > 0 && (
                        <Badge className="h-4 min-w-4 px-1 text-[9px] font-black bg-amber-500 hover:bg-amber-500 text-white border-none">
                          {pendingReviews}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-xs font-bold">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur px-3 md:px-6 py-2.5 shrink-0 shadow-sm">
          <div>
            <h1 className="text-sm font-black text-gray-900 tracking-tight">{activeTab}</h1>
            <p className="text-[10px] text-gray-400">Dopik Electronics Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => queryClient.invalidateQueries()}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[10px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <RefreshCw className="h-3 w-3" /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <a href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
              <Eye className="h-3 w-3" /> View Store
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 md:pb-6">
          {/* Products */}
          {activeTab === "Products" ? (
            subView === "add" ? (
              <AdminAddProduct onBack={() => setSubView("list")} />
            ) : subView === "edit" && editId ? (
              <AdminEditProduct productId={editId} onBack={() => { setSubView("list"); setEditId(null); }} />
            ) : (
              <AdminProducts onAddClick={() => setSubView("add")} onEditClick={(id) => { setEditId(id); setSubView("edit"); }} />
            )
          ) : activeTab === "Orders" ? (
            <AdminOrders />
          ) : activeTab === "Reviews" ? (
            <AdminReviews />
          ) : activeTab === "Hot Deals" ? (
            <AdminHotDeals />
          ) : activeTab === "Home Sections" ? (
            <AdminHomeSections />
          ) : activeTab === "Videos" ? (
            <AdminVideos />
          ) : activeTab === "Featured Slides" ? (
            <AdminFeaturedSlides />
          ) : activeTab === "Coupons" ? (
            <AdminCoupons />
          ) : activeTab === "Customers" ? (
            <AdminCustomers />
          ) : activeTab === "Users" ? (
            <UserManagement />
          ) : activeTab === "Settings" ? (
            <AdminSettings />
          ) : activeTab === "Audit Log" ? (
            <AdminAuditLog />
          ) : (

            /* ── Dashboard ── */
            <div className="space-y-4 md:space-y-6 text-gray-900">

              {/* Time range + quick actions */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm overflow-x-auto max-w-full">
                  {(["today", "7days", "30days", "lifetime"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                        timeRange === r ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-700"
                      )}
                    >
                      {r === "7days" ? "7 Days" : r === "30days" ? "30 Days" : r === "today" ? "Today" : "All Time"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={qa.action}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                      <qa.icon className="h-3 w-3" />
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {statCards.map((c) => (
                  <StatCard key={c.title} {...c} />
                ))}
              </div>

              {/* Chart + Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500">Revenue & Orders</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> Revenue</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" /> Orders</span>
                    </div>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dash?.chartData || []}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(0,0,0,0.25)"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        />
                        <YAxis stroke="rgba(0,0,0,0.25)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="orders" stroke="#22d3ee" strokeWidth={2} fill="url(#ordGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                  {/* Low Stock */}
                  <div className={cn(
                    "rounded-2xl border p-4",
                    (!stats?.lowStockProducts?.length) ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      {!stats?.lowStockProducts?.length
                        ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">All In Stock</span></>
                        : <><AlertTriangle className="h-3.5 w-3.5 text-red-500" /><span className="text-[10px] font-black uppercase tracking-widest text-red-600">Low Stock Alert</span></>
                      }
                    </div>
                    {stats?.lowStockProducts?.length > 0 ? (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {stats.lowStockProducts.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-gray-800 truncate">{p.name}</p>
                              <p className="text-[9px] text-gray-400 uppercase font-black">{p.brand}</p>
                            </div>
                            <button onClick={() => setActiveTab("Products")} className="text-red-400 hover:text-red-600 shrink-0">
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400">All products are well-stocked.</p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Actions</p>
                    {[
                      { label: "Manage Products", tab: "Products", icon: Package, color: "text-blue-500" },
                      { label: "Process Orders", tab: "Orders", icon: ShoppingCart, color: "text-orange-500" },
                      { label: "Review Pending", tab: "Reviews", icon: Star, color: "text-yellow-500" },
                      { label: "Edit Homepage", tab: "Home Sections", icon: Layers, color: "text-emerald-500" },
                    ].map((a) => (
                      <button
                        key={a.tab}
                        onClick={() => setActiveTab(a.tab)}
                        className="w-full flex items-center gap-3 rounded-xl p-2.5 border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                      >
                        <a.icon className={cn("h-3.5 w-3.5 shrink-0", a.color)} />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 flex-1">{a.label}</span>
                        <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-gray-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed md:hidden bottom-0 inset-x-0 flex justify-around items-center h-16 bg-white border-t border-gray-200 z-50 shadow-lg">
        {[
          { id: "Dashboard", icon: LayoutDashboard },
          { id: "Products", icon: Package },
          { id: "Orders", icon: ShoppingCart },
          { id: "Reviews", icon: Star },
          { id: "Settings", icon: Settings },
        ].map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn("flex flex-col items-center justify-center flex-1 py-2 transition-colors", activeTab === id ? "text-primary" : "text-gray-400")}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-[9px] font-bold">{id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
