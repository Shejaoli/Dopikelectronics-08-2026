import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, Search, HelpCircle, Info, User, MapPin, ChevronRight, Flame, Smartphone, Laptop, Tablet, Watch, Gamepad2, Wrench, Home as HomeIcon, Smartphone as ElectronicsIcon, Layers, Heart, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";
import type { Product } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/contexts/WishlistContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Secret admin access: triple-click logo within 600ms
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<NodeJS.Timeout | null>(null);
  const handleLogoClick = (e: React.MouseEvent) => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 600);
    if (logoClickCount.current >= 3) {
      e.preventDefault();
      logoClickCount.current = 0;
      setLocation("/xdopik-portal");
    }
  };

  const { data: customer } = useQuery<{ id: number; fullName: string; email: string } | null>({
    queryKey: ["/api/customer/me"],
    retry: false,
    staleTime: 60000,
    queryFn: async () => {
      try {
        const res = await fetch("/api/customer/me", { credentials: "include" });
        if (!res.ok) return null;
        return res.json();
      } catch { return null; }
    },
  });

  const { wishlist } = useWishlist();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/customer/logout", {}),
    onSuccess: () => {
      queryClient.setQueryData(["/api/customer/me"], null);
      toast({ title: "Signed out", description: "See you next time!" });
    },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const products = await res.json();
          setSearchSuggestions(products.slice(0, 8));
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);
  };

  const handleSelectSuggestion = (product: Product) => {
    setLocation(`/product/${product.slug}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSelectSuggestion(searchSuggestions[selectedIndex]);
      } else {
        handleSearch(e as any);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "All Items", href: "/shop" },
    { name: "Deals 🔥", href: "/deals" },
    { name: "iPhones", href: "/iphones" },
    { name: "Laptops", href: "/laptops" },
    { name: "Electronics", href: "/electronics" },
    { name: "Samsung Phones", href: "/shop?search=samsung&category=Smartphones" },
    { name: "Home", href: "/home-kitchen" },
    { name: "Tools", href: "/tools-home-improvement" },
    { name: "Gaming", href: "/gaming" },
  ];

  const additionalPages = [
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Help & Support", href: "/contact", icon: HelpCircle },
    { name: "Shop All Products", href: "/shop", icon: ShoppingBag },
  ];

  const isActive = (path: string) => location === path;

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* Slide-out overlay + menu — rendered at root level so fixed positioning works correctly */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            />
            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[101] w-full max-w-xs bg-background shadow-2xl flex flex-col"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b shrink-0">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <img src="/images/logo.png" alt="DOPIK" className="h-6 object-contain" />
                  <span className="font-bold tracking-tighter">DOPIK</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Section 1: Promo */}
                <div className="rounded-2xl bg-primary/5 p-3 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Flame className="h-4 w-4" />
                    <span className="font-bold text-sm">Hot Deals</span>
                  </div>
                  <Link href="/deals" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-between group text-sm h-9">
                      Browse Deals
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>

                {/* Section 2: Trending */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Trending</h3>
                  <div className="space-y-0.5">
                    {[
                      { name: "Smartphones", icon: Smartphone, href: "/shop?category=Smartphones" },
                      { name: "Laptops", icon: Laptop, href: "/laptops" },
                      { name: "Tablets", icon: Tablet, href: "/shop?category=Tablets" },
                      { name: "Smartwatches", icon: Watch, href: "/shop?category=Smartwatches" },
                    ].map((item) => (
                      <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Section 3: Shop by Department */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Shop by Department</h3>
                  <div className="space-y-0.5">
                    {[
                      { name: "Electronics", icon: ElectronicsIcon, href: "/electronics" },
                      { name: "Home & Kitchen", icon: HomeIcon, href: "/home-kitchen" },
                      { name: "Gaming", icon: Gamepad2, href: "/gaming" },
                      { name: "Tools", icon: Wrench, href: "/tools-home-improvement" },
                      { name: "Others", icon: Layers, href: "/shop" },
                    ].map((item) => (
                      <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Section 4: Help & Settings */}
                <div className="pt-3 border-t">
                  <div className="space-y-0.5">
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Help</span>
                      </div>
                    </Link>
                    {customer ? (
                      <button
                        onClick={() => { logoutMutation.mutate(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Sign Out ({customer.fullName.split(" ")[0]})</span>
                      </button>
                    ) : (
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">Sign In</span>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-out backdrop-blur-[28px] saturate-180 ${
        scrolled
          ? "bg-white/80 dark:bg-background/80 shadow-[inset_0_-1px_0_rgba(255,255,255,0.28),inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.14)] border-b border-white/20 dark:border-white/12"
          : "bg-white/55 dark:bg-background/55 shadow-[inset_0_-1px_0_rgba(255,255,255,0.18)] border-b border-white/14 dark:border-white/8"
      }`}
    >

      {/* Top Utility Bar */}
      <div className="hidden lg:block shadow-[inset_0_-1px_0_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] border-b border-white/10 dark:border-white/6">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left - Placeholder for alignment */}
          <div className="w-48"></div>

          {/* Center - Search */}
          <div className="flex flex-1 justify-center px-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                placeholder="Search by model, color, brand..."
                autoComplete="off"
                className="h-9 w-full rounded-full border border-border bg-background pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </button>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    <div className="max-h-96 overflow-y-auto">
                      {searchSuggestions.map((product, idx) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectSuggestion(product)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            idx === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                          } border-b last:border-b-0`}
                        >
                          <img
                            src={product.imageUrl?.startsWith("http") ? product.imageUrl : (import.meta.env.VITE_API_URL || "") + product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{(product.price).toLocaleString()} RWF</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Right - Location & Icons */}
          <div className="flex items-center gap-4 border-l border-border pl-6">
            <Link href="/contact" className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-primary">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden xl:inline">Help</span>
            </Link>
            <Link href="/about" className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-primary">
              <Info className="h-4 w-4" />
              <span className="hidden xl:inline">About</span>
            </Link>
            {customer ? (
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
                title={`Signed in as ${customer.fullName}`}
              >
                <User className="h-4 w-4 text-primary" />
                <span className="hidden xl:inline font-semibold text-primary">{customer.fullName.split(" ")[0]}</span>
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-primary">
                <User className="h-4 w-4" />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
            )}
            <Link href="/wishlist" className="relative flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-primary" title="Wishlist">
              <Heart className="h-4 w-4" />
              <span className="hidden xl:inline">Wishlist</span>
              {customer && wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 xl:static xl:ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <CartDrawer />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav>
        {/* ============ MOBILE NAVBAR (noon-style) ============ */}
        <div className="lg:hidden flex flex-col gap-2 px-3 py-2.5">
          {/* Row 1: Hamburger + Logo + Cart */}
          <div className="flex items-center gap-2">
            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 -ml-1 text-foreground hover:bg-accent/60 rounded-lg transition-all active:scale-90 shrink-0"
              data-testid="button-mobile-menu"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" strokeWidth={2.2} />
            </button>

            {/* Logo - same logo as desktop */}
            <Link href="/" onClick={handleLogoClick} className="flex items-center gap-1.5 shrink-0 min-w-0 flex-1" data-testid="link-mobile-logo">
              <img
                src="/images/logo.png"
                alt="DOPIK"
                className="h-7 object-contain shrink-0"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span className="text-base font-bold tracking-tighter text-foreground whitespace-nowrap">
                DOPIK <span className="text-primary">ELECTRONICS</span>
              </span>
            </Link>

            {/* Theme Toggle on mobile */}
            <ThemeToggle />
          </div>

          {/* Row 2: Inline Search Bar (noon style) */}
          <form
            onSubmit={handleSearch}
            className="relative w-full"
            data-testid="form-mobile-search"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              autoComplete="off"
              className="h-10 w-full rounded-lg bg-muted/70 dark:bg-muted/40 border border-border/60 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              data-testid="input-mobile-search"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* ============ DESKTOP NAVBAR ============ */}
        <div className="hidden lg:flex mx-auto h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2">
            <div className="relative h-8 w-auto overflow-hidden shrink-0">
              <img src="/images/logo.png" alt="DOPIK" className="h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-foreground">
              DOPIK <span className="text-primary">ELECTRONICS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="flex flex-1 justify-center px-4">
            <div className="flex items-center gap-6">
              {/* Hamburger Menu before All Items */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="cursor-pointer text-sm font-semibold transition-all hover:text-primary active:scale-95 text-gray-800 dark:text-gray-100"
                title="More Pages"
              >
                <span className="text-lg">☰</span>
              </button>
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <span
                    className={`cursor-pointer text-sm font-semibold transition-all hover:text-primary active:scale-95 whitespace-nowrap ${
                      isActive(link.href) ? "text-primary" : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-4">
            <CartDrawer />
          </div>
        </div>
      </nav>
    </header>
    </>
  );
}
