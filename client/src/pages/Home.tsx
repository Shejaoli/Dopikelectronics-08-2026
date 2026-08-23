import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
function useTouchSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 10) e.preventDefault();
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) onSwipeLeft();
      else onSwipeRight();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [onSwipeLeft, onSwipeRight]);
  return { onTouchStart, onTouchMove, onTouchEnd };
}
import { useQuery } from "@tanstack/react-query";
import { CouponCode } from "@shared/schema";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Gamepad2,
  Headphones,
  Wrench,
  Monitor,
  Trash2,
  Tv,
  Users,
  Timer,
  Volume2,
  VolumeX,
  Check,
  MapPin,
  Zap,
  Sparkles,
  Play,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import images
import banner1 from "@assets/stock_images/high_quality_banner__3cb20b92.jpg";
import banner2 from "@assets/stock_images/high_quality_banner__880fc6d2.jpg";
import banner3 from "@assets/stock_images/high_quality_banner__b1407c03.jpg";

// Category Images
import smartphonesCat from "@assets/Phone_category_1768723350746.png";
import laptopsCat from "@assets/Laptop_category_1768723909466.png";
import tabletsCat from "@assets/tablet_category_1768724210189.png";
import watchesCat from "@assets/smartwatches_category_1768746560605.png";
import gamingCat from "@assets/Gaming_category_1768746932352.png";
import audioCat from "@assets/Audio_category_1768748035466.png";
import accessoriesCat from "@assets/Accessoirs_category_1768748494801.png";
import electronicsCat from "@assets/Electronics_category_1768749381858.png";

// Custom Assets for First Slide
import controllerImg from "@assets/32497_1_1768720576552.png";
import phoneImg from "@assets/Apple-iPhone-15-Pro-vs-Samsung-Galaxy-S23-Ultra-cameras_1768720576555.png";
import macbookImg from "@assets/apple-macbook-air-15in-m4_1768720576555.png";

const HomeHero = () => {
  const slides = [
    {
      bgColor: "bg-[#D1F3F5]",
      textColor: "text-[#012E40]",
      isFirst: true,
      title: "Certified Electronic Shop",
      subtitle: "in Kigali, Rwanda",
      buttonText: "Shop Deals",
      buttonHref: "/deals",
      image: null
    },
    {
      bgColor: "bg-gradient-to-br from-[#010033] to-[#020066]",
      textColor: "text-white",
      isFirst: false,
      title: "Latest Smartphones",
      subtitle: "Experience the future with the newest iPhone and Samsung models. All devices are certified, come with a 12-month warranty, and include free delivery in Kigali.",
      buttonText: "View Phones",
      buttonHref: "/products?category=smartphones",
      image: phoneImg
    },
    {
      bgColor: "bg-gradient-to-br from-[#010033] to-[#020066]",
      textColor: "text-white",
      isFirst: false,
      title: "Premium Laptops",
      subtitle: "Boost your productivity with high-performance MacBooks and Dell XPS laptops. Professionally tested, cleaned, and backed by our local support team.",
      buttonText: "Browse Laptops",
      buttonHref: "/products?category=laptops",
      image: macbookImg
    }
  ];

  return (
    <section className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="h-[180px] sm:h-[220px] lg:h-[270px] xl:h-[330px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={`relative w-full h-full flex items-center justify-center overflow-hidden ${slide.bgColor} ${slide.textColor}`}
            >
              {slide.isFirst ? (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full h-full relative flex items-center justify-center">
                  {/* Macbook - Left Side */}
                  <div className="absolute left-[-22%] lg:left-[-12%] bottom-[-5%] lg:bottom-[-2%] w-[45%] lg:w-[32%] z-10 rotate-[-5deg]">
                    <img src={macbookImg} alt="Macbook" className="w-full h-auto object-contain" />
                  </div>

                  {/* Phone - Bottom Center-ish but slightly left of center */}
                  <div className="absolute left-[25%] lg:left-[30%] bottom-[-5%] w-[30%] lg:w-[25%] z-10">
                    <img src={phoneImg} alt="Phones" className="w-full h-auto object-contain" />
                  </div>
                  
                  <div className="relative z-20 space-y-3 text-center px-4 w-full max-w-2xl mx-auto">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-lg font-medium opacity-90 line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>
                    
                    <Link href={slide.buttonHref}>
                      <Button size="lg" className="rounded-full px-10 h-12 text-base font-bold mt-2 bg-[#0066FF] hover:bg-[#0055DD] text-white border-none shadow-lg">
                        {slide.buttonText}
                      </Button>
                    </Link>
                  </div>

                  {/* Controller - Far Right Bottom/Side */}
                  <div className="absolute right-[-22%] lg:right-[-12%] top-[10%] lg:top-[5%] w-[45%] lg:w-[35%] z-10 rotate-[15deg]">
                    <img src={controllerImg} alt="Controller" className="w-full h-auto object-contain" />
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center w-full h-full text-[#010033]">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-[#9cbbe5]">
                      {slide.title}
                    </h1>
                    <p className="text-base text-muted-foreground/80 max-w-lg hidden sm:block text-[#b0d2ff]">
                      {slide.subtitle}
                    </p>
                    <Link href={slide.buttonHref}>
                      <Button size="sm" className="rounded-full px-8 h-10 text-base font-bold">
                        {slide.buttonText}
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden lg:flex justify-end relative">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="max-h-[220px] lg:max-h-[280px] xl:max-h-[340px] object-contain drop-shadow-2xl" 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

const trustItems = [
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "12-Month Warranty", sub: "Genuine protection", color: "bg-primary/10 text-primary" },
  { icon: <Check className="w-3.5 h-3.5" />, label: "Quality Checked", sub: "Rigorously tested", color: "bg-primary/10 text-primary" },
  { icon: <MapPin className="w-3.5 h-3.5" />, label: "Kigali Support", sub: "Local expert help", color: "bg-primary/10 text-primary" },
  { icon: <Star className="w-3.5 h-3.5 fill-yellow-600" />, label: "4.7 Google Reviews", sub: "Trusted by thousands", color: "bg-yellow-400/10 text-yellow-600" },
];

const TrustBar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-slate-900 border-b relative z-30"
    >
      {/* Mobile: scrolling ticker at 80% scale */}
      <div className="md:hidden overflow-hidden py-2">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {[...trustItems, ...trustItems].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mx-5 shrink-0" style={{ transform: "scale(0.8)", transformOrigin: "left center" }}>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-[11px] font-bold leading-none mb-0.5">{item.label}</span>
                <span className="text-[9px] text-muted-foreground/70">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden md:block py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4 items-center justify-items-center">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.color} transition-transform group-hover:scale-110`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-none mb-1">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground/70">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
const RecommendedProducts = () => {
  const { data: allProducts } = useProducts();
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [recommendationReason, setRecommendationReason] = useState<string | null>(null);

  useEffect(() => {
    const viewedIdsStr = localStorage.getItem("recentlyViewed");
    if (viewedIdsStr && allProducts) {
      const viewedIds = JSON.parse(viewedIdsStr) as number[];
      // Get the 6 most recent unique products
      const products = viewedIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 6);
      
      setRecentlyViewed(products);
      
      if (products.length > 0) {
        setRecommendationReason(`Because you viewed ${products[0].name}`);
      }
    }
  }, [allProducts]);

  // Fallback to "Popular in Kigali" (Featured) or "Best Value" (Deals)
  const displayProducts = recentlyViewed.length > 0 
    ? recentlyViewed 
    : allProducts?.filter(p => p.isFeatured || p.category === "Deals").slice(0, 6) || [];

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-5 sm:py-8 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          {recommendationReason && recentlyViewed.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium italic">
              <RotateCcw className="w-3 h-3 text-primary" /> {recommendationReason}
            </p>
          )}
          {!recommendationReason && (
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">
              Popular in Kigali • Best value today
            </p>
          )}
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {displayProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
          </div>
        </Carousel>
      </div>
    </section>
  );
};
const PopularCategories = () => {
  const categories = [
    { name: "Smartphones", image: smartphonesCat, href: "/shop?category=Smartphones", description: "New & Refurbished" },
    { name: "Laptops", image: laptopsCat, href: "/shop?category=Laptops", description: "Power & Portability" },
    { name: "Tablets", image: tabletsCat, href: "/shop?category=Tablets", description: "On the go or on the fly" },
    { name: "Smartwatches", image: watchesCat, href: "/shop?category=Smartwatches", description: "Stay connected" },
    { name: "Gaming", image: gamingCat, href: "/gaming", description: "Consoles & Controllers" },
    { name: "Audio", image: audioCat, href: "/shop?category=Audio", description: "Immersive Sound" },
    { name: "Accessories", image: accessoriesCat, href: "/shop?category=Accessories", description: "Bundles & Gear" },
    { name: "Electronics", image: electronicsCat, href: "/shop?category=Electronics", description: "Premium Tech" },
  ];

  return (
    <section className="py-4 sm:py-8 bg-gradient-to-b from-transparent to-muted/10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-8">Popular Categories</h2>
        <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-6 lg:gap-8">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <div className="flex flex-col items-center justify-center gap-1 sm:gap-4 text-center cursor-pointer group p-1.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-primary/10">
                <div className="relative w-14 h-14 sm:w-32 sm:h-32 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-contain z-10 drop-shadow-md group-hover:drop-shadow-xl" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-cyan-100/30 flex items-center justify-center group-hover:bg-cyan-100/50 transition-colors">
                      {(cat as any).icon && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 text-primary/70">
                          {(cat as any).icon}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <span className="block font-bold text-[10px] sm:text-sm tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">{cat.name}</span>
                  <span className="hidden sm:block text-[10px] font-medium text-muted-foreground/80 line-clamp-1">{cat.description}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
const CustomerFavorites = () => {
  const { data: smartphones } = useProducts({ category: "Smartphones" });
  const { data: laptops } = useProducts({ category: "Laptops" });
  const { data: tablets } = useProducts({ category: "Tablets" });
  const { data: audio } = useProducts({ category: "Audio" });
  const { data: home } = useProducts({ category: "Home" });

  const categories = [
    { label: "Smartphones", products: smartphones },
    { label: "Laptops", products: laptops },
    { label: "Tablets", products: tablets },
    { label: "Audio", products: audio },
    { label: "Home", products: home },
  ];

  return (
    <>
      {categories.map((category) => {
        if (!category.products || category.products.length === 0) return null;
        
        return (
          <section key={category.label} className="py-5 sm:py-8 border-b">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-2xl font-bold">Customer Favorites {category.label}</h2>
                <Link href={`/shop?category=${category.label}`}>
                  <Button variant="ghost" className="text-primary font-bold">
                    See all <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {category.products.slice(0, 8).map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                </div>
              </Carousel>
            </div>
          </section>
        );
      })}
    </>
  );
};
const TopDeals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: hotDeals } = useQuery<any[]>({
    queryKey: ["/api/products/hot-deals"],
    queryFn: async () => {
      const res = await fetch("/api/products/hot-deals");
      return res.ok ? res.json() : [];
    },
  });

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
    return { hours: Math.floor(diff / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const products = (hotDeals || []).filter((p: any) => p.hotDealDiscount && p.hotDealDiscount > 0);
  if (products.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="w-full py-5 px-3 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Today's Top Deals</h2>
          <Link href="/deals" className="flex items-center gap-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── MOBILE: stacked (timer on top, products below) ── */}
        <div className="flex flex-col gap-3 sm:hidden">

          {/* Mobile timer banner — full width, with product images peeking right */}
          <div
            className="relative rounded-2xl overflow-hidden flex items-stretch"
            style={{
              minHeight: 130,
              background: "radial-gradient(ellipse at 25% 50%, #2a2200 0%, #111111 60%, #0a0a0a 100%)",
            }}
          >
            {/* Glow */}
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(245,206,51,0.18) 0%, transparent 70%)" }} />

            {/* Left: label + timer + button */}
            <div className="relative z-10 flex flex-col justify-center gap-1.5 px-4 py-4 flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#F5CE33" }}>SAVE UP TO 70%</p>
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Today Deals</p>
              <div className="font-black text-white tabular-nums text-3xl tracking-widest leading-none">
                {pad(timeLeft.hours)}<span style={{ color: "#F5CE33" }} className="mx-1">:</span>{pad(timeLeft.minutes)}<span style={{ color: "#F5CE33" }} className="mx-1">:</span>{pad(timeLeft.seconds)}
              </div>
              <Link href="/deals" className="mt-1">
                <button
                  className="font-black text-[11px] px-5 py-2 rounded-xl transition-all active:scale-95 shadow-lg whitespace-nowrap"
                  style={{ background: "#F5CE33", color: "#111111" }}
                >
                  Shop all Deals
                </button>
              </Link>
            </div>

          </div>

          {/* Mobile product carousel */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide py-1 select-none"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
          >
            {products.slice(0, 12).map((product: any) => (
              <div
                key={product.id}
                className="shrink-0 relative"
                style={{ width: 148, minWidth: 148 }}
              >
                <div className="absolute top-2 left-2 z-10">
                  <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                    🔥 Flash Sale
                  </span>
                </div>
                <ProductCard product={product} hideFeaturedBadge />
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP: side-by-side (timer left, products right) ── */}
        <div className="hidden sm:flex gap-3 items-stretch">

          {/* Dark timer card */}
          <div
            className="shrink-0 relative rounded-2xl overflow-hidden flex flex-col items-center justify-between"
            style={{
              width: 176,
              minWidth: 176,
              minHeight: 290,
              background: "radial-gradient(ellipse at 50% 35%, #2a2200 0%, #111111 55%, #0a0a0a 100%)",
            }}
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(245,206,51,0.13) 0%, transparent 70%)" }} />

            <svg viewBox="0 0 200 90" className="w-full absolute top-0 left-0 z-10" aria-hidden="true">
              <defs><path id="arc-top-td" d="M 18,78 A 88,88 0 0,1 182,78" /></defs>
              <text fill="#F5CE33" fontSize="12.5" fontWeight="900" fontFamily="system-ui,sans-serif" letterSpacing="1.5">
                <textPath href="#arc-top-td" startOffset="50%" textAnchor="middle">SAVE UP TO 70%</textPath>
              </text>
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 pt-10 pb-2 w-full px-3">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Today Deals</p>
              <div className="font-black text-white tabular-nums text-2xl tracking-wider leading-none">
                {pad(timeLeft.hours)}<span style={{ color: "#F5CE33" }} className="mx-0.5">:</span>{pad(timeLeft.minutes)}<span style={{ color: "#F5CE33" }} className="mx-0.5">:</span>{pad(timeLeft.seconds)}
              </div>
              <Link href="/deals" className="w-full mt-5">
                <button
                  className="w-full font-black text-xs py-2.5 rounded-xl transition-all active:scale-95 shadow-lg"
                  style={{ background: "#F5CE33", color: "#111111" }}
                >
                  Shop all Deals
                </button>
              </Link>
            </div>

            <svg viewBox="0 0 200 90" className="w-full absolute bottom-0 left-0 z-10" aria-hidden="true">
              <defs><path id="arc-bot-td" d="M 18,12 A 88,88 0 0,0 182,12" /></defs>
              <text fill="#F5CE33" fontSize="12.5" fontWeight="900" fontFamily="system-ui,sans-serif" letterSpacing="1.5">
                <textPath href="#arc-bot-td" startOffset="50%" textAnchor="middle">DEALS ADDED DAILY</textPath>
              </text>
            </svg>
          </div>

          {/* Desktop product carousel */}
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => scroll("left")}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ArrowRight className="h-4 w-4 rotate-180 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ArrowRight className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </button>
            <div
              className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-6 select-none"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 88%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 88%, transparent 100%)",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
              }}
            >
              {products.slice(0, 12).map((product: any) => (
                <div
                  key={product.id}
                  className="shrink-0 relative"
                  style={{ width: 164, minWidth: 164 }}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                      🔥 Flash Sale
                    </span>
                  </div>
                  <ProductCard product={product} hideFeaturedBadge />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
const TrustBanner = () => {
  return (
    <section className="py-6 sm:py-10 bg-gradient-to-b from-teal-50/30 to-transparent dark:from-teal-950/10 dark:to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-400">Premium Refurbished. Trusted Quality.</h2>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="bg-green-500 p-0.5 rounded-sm">
                <Star className="w-3 h-3 fill-white text-white" />
              </div>
              <span className="font-bold text-teal-900 dark:text-white">Google Reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { title: "Save up to 70%", icon: Star },
              { title: "12 Months Warranty", icon: ShieldCheck },
              { title: "30-Day Returns", icon: RotateCcw },
              { title: "Quality Checked", icon: Star },
              { title: "Save CO₂ vs new", icon: Star }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <p className="font-bold text-teal-900 dark:text-teal-400 text-sm leading-tight">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
const MaximizeSavings = () => {
  const savingsDeals = [
    { badge: "10% Off", badgeColor: "#1565C0", img: "/images/ugreen-adapter.jpg", name: "USB-C Hub", worth: "RWF 6,500" },
    { badge: "Free", badgeColor: "#25a244", img: "/images/soundcore-liberty-4.jpg", name: "Earbuds Case", worth: "RWF 8,000" },
    { badge: "Flash", badgeColor: "#e53935", img: "/images/iphone-16.png", name: "iPhone 16", worth: "RWF 1,200,000" },
    { badge: "BOGO", badgeColor: "#FFC107", img: "/images/beats-pill.jpg", name: "Beats Pill", worth: "RWF 250,000" },
    { badge: "15% Off", badgeColor: "#1565C0", img: "/images/saramonic-mic.jpg", name: "Mic System", worth: "RWF 42,000" },
    { badge: "Free", badgeColor: "#25a244", img: "/images/iphone-17-pro-max-1.png", name: "Screen Guard", worth: "RWF 5,000" },
  ];

  const { data: activeCoupons = [] } = useQuery<CouponCode[]>({
    queryKey: ["/api/coupons"],
    staleTime: 60000,
  });

  const ScrollRow = ({ items }: { items: typeof savingsDeals }) => (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {items.map((item, i) => (
        <Link key={i} href="/shop">
          <div className="flex-shrink-0 w-[100px] h-[130px] rounded-[10px] bg-[#f5f5f5] dark:bg-gray-800 overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col">
            <div className="relative flex-1 bg-white dark:bg-gray-700 flex items-center justify-center p-1 min-h-0">
              <span
                className="absolute top-1 left-1 z-10 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none"
                style={{ backgroundColor: item.badgeColor, color: "#fff" }}
              >
                {item.badge}
              </span>
              <img src={item.img} alt={item.name} className="h-full w-full object-contain" />
            </div>
            <div className="px-1.5 pt-1 pb-1.5 bg-[#f5f5f5] dark:bg-gray-800">
              <p className="text-[10px] font-semibold text-gray-800 dark:text-gray-200 leading-tight line-clamp-2">{item.name}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">worth {item.worth}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <section className="px-3 py-3 space-y-3 max-w-7xl mx-auto">
      {/* Row 1 — Maximize your savings */}
      <div className="bg-white dark:bg-gray-900 rounded-[14px] p-3 md:p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[14px] md:text-base font-black text-gray-900 dark:text-white">Maximize your savings</h2>
          <Link href="/shop" className="text-[12px] font-semibold text-[#1565C0] hover:underline">
            See all →
          </Link>
        </div>
        <ScrollRow items={savingsDeals} />
      </div>

      {/* Row 2 — Top deals for you (with live coupon codes from admin) */}
      {activeCoupons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-[14px] p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[14px] md:text-base font-black text-gray-900 dark:text-white">Live coupon deals</h2>
            <Link href="/deals" className="text-[12px] font-semibold text-[#1565C0] hover:underline">
              See all →
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {activeCoupons.map((coupon) => {
              const color = (coupon as any).badgeColor || "#1565C0";
              const label = coupon.discountType === "percentage"
                ? `${coupon.discountValue}% off`
                : `RWF ${coupon.discountValue.toLocaleString()} off`;
              return (
                <div
                  key={coupon.id}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ border: `1.5px dashed ${color}`, backgroundColor: `${color}12` }}
                  onClick={() => navigator.clipboard?.writeText(coupon.code)}
                  title="Click to copy code"
                >
                  <span className="text-[9px] font-bold" style={{ color }}>{coupon.label || label}</span>
                  <span className="text-[8px] font-black bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full font-mono" style={{ color, border: `1px solid ${color}40` }}>
                    {coupon.code}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

const HomeProducts = () => {
  const { data: products } = useProducts({ category: "Home" });
  
  if (!products || products.length === 0) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-5 sm:py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold">Home Products</h2>
          <Link href="/home-kitchen">
            <Button variant="ghost" className="text-primary font-bold">
              See all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {products.slice(0, 8).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
          </div>
        </Carousel>
      </div>
    </motion.section>
  );
};
const GamingPreview = () => {
  const { data: products } = useProducts({ category: "Gaming" });
  
  if (!products || products.length === 0) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-5 sm:py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold">Gaming Gear</h2>
          <Link href="/gaming">
            <Button variant="ghost" className="text-primary font-bold">
              See all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {products.slice(0, 6).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
          </div>
        </Carousel>
      </div>
    </motion.section>
  );
};
export const CircularEconomy = () => {
  const { data: dbVideos, isLoading } = useQuery<any[]>({
    queryKey: ["/api/videos"]
  });

  const activeDbVideos = dbVideos?.filter(v => v.isActive) || [];
  const featuredVideos = activeDbVideos.filter(v => v.isFeatured);
  const sortedVideos = [
    ...featuredVideos,
    ...activeDbVideos.filter(v => !v.isFeatured),
  ];

  const defaultVideos = [
    { id: -1, url: "/videos/economy.mp4", title: null, description: null },
    { id: -2, url: "/videos/iphone17.mp4", title: null, description: null },
  ];

  const displayVideos = sortedVideos.length > 0 ? sortedVideos : defaultVideos;

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const activeVideo = displayVideos[activeIdx] || displayVideos[0];

  const pauseAll = () => {
    mobileVideoRef.current?.pause();
    videoRefs.current.forEach(r => r?.pause());
  };

  const playActive = (idx: number) => {
    // Only play one layout at a time to prevent audio echo
    if (window.matchMedia("(min-width: 768px)").matches) {
      mobileVideoRef.current?.pause();
      videoRefs.current[idx]?.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRefs.current.forEach(r => r?.pause());
      mobileVideoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playActive(activeIdx);
        } else {
          pauseAll();
          setIsPlaying(false);
        }
      });
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, [activeIdx, displayVideos]);

  const switchTo = (idx: number) => {
    pauseAll();
    setActiveIdx(idx);
    // play after state update on next tick
    setTimeout(() => playActive(idx), 0);
  };

  const handleEnded = (idx: number) => {
    const next = (idx + 1) % displayVideos.length;
    switchTo(next);
  };

  // Keep a ref to the latest activeIdx & length so swipe handler is never stale
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;
  const videosLenRef = useRef(displayVideos.length);
  videosLenRef.current = displayVideos.length;
  const switchToRef = useRef(switchTo);
  switchToRef.current = switchTo;

  const videoCarouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = videoCarouselRef.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > dy && dx > 10) e.preventDefault();
    };
    const onEnd = (e: TouchEvent) => {
      const delta = startX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) {
        const len = videosLenRef.current;
        const cur = activeIdxRef.current;
        if (delta > 0) switchToRef.current((cur + 1) % len);
        else switchToRef.current((cur - 1 + len) % len);
      }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, []); // runs once — handlers always read fresh values via refs

  if (isLoading) return null;

  const glowColors = [
    "from-[#0066FF] to-[#F5CE33]",
    "from-[#F5CE33] to-[#0066FF]",
    "from-[#0066FF] to-cyan-400",
    "from-[#F5CE33] to-orange-400",
  ];

  return (
    <section ref={sectionRef} className="w-full py-4 px-3 md:px-6 lg:px-8" data-testid="promo-videos-section">
      <div
        ref={videoCarouselRef}
        className="relative w-full rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #070d1f 0%, #0a1020 50%, #050a18 100%)" }}
      >
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-80 h-80 bg-[#0066FF]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#F5CE33]/8 rounded-full blur-[80px] pointer-events-none" />
      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* ── MOBILE layout: video fills top of card, info below ── */}
      <div className="relative z-10 flex flex-col md:hidden">
        {/* Active video — full width at top. key=activeIdx forces remount on switch */}
        <div className="relative w-full overflow-hidden" style={{ height: "clamp(380px, 72vh, 560px)" }}>
          <video
            key={activeVideo?.id ?? activeIdx}
            ref={mobileVideoRef}
            src={activeVideo?.url}
            muted={isMuted}
            playsInline
            autoPlay
            loop={displayVideos.length === 1}
            onEnded={() => handleEnded(activeIdx)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d1f] via-transparent to-black/15 pointer-events-none" />
          {/* LIVE badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          </div>
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-3 right-3 rounded-full bg-black/50 border border-white/20 p-2 backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-white/60" /> : <Volume2 className="h-3.5 w-3.5 text-[#F5CE33]" />}
          </button>
          {/* Nav arrows */}
          {displayVideos.length > 1 && (
            <>
              <button
                onClick={() => switchTo((activeIdx - 1 + displayVideos.length) % displayVideos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/20 p-1.5 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => switchTo((activeIdx + 1) % displayVideos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/20 p-1.5 backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Info + CTAs below video */}
        <div className="px-5 pt-5 pb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 px-3 py-1 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5CE33] animate-pulse" />
            <span className="text-[10px] font-black text-[#F5CE33] uppercase tracking-[0.2em]">Promo Spotlight</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight tracking-tight mb-1">Drop-Worthy</h2>
          <div className="inline-block bg-white/10 border border-white/15 text-white text-2xl font-black px-4 py-1 rounded-xl mb-3 tracking-tight">
            Deals & Promos
          </div>
          {activeVideo?.title ? (
            <p className="text-sm font-bold text-white/80 mb-4 line-clamp-2">{activeVideo.title}</p>
          ) : (
            <p className="text-sm text-white/50 mb-4">Exclusive offers, flash sales, and new drops every week.</p>
          )}
          {displayVideos.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {displayVideos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => switchTo(i)}
                  data-testid={`promo-dot-${i}`}
                  className={`transition-all duration-300 rounded-full ${i === activeIdx ? "w-6 h-2 bg-[#F5CE33]" : "w-2 h-2 bg-white/20"}`}
                />
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            <Link href="/shop">
              <button data-testid="promo-shop-btn" className="w-full flex items-center justify-center gap-2 bg-[#0066FF] text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95">
                <ArrowRight className="h-4 w-4" /> Shop All Deals
              </button>
            </Link>
            <button
              data-testid="promo-mute-btn"
              onClick={() => setIsMuted(!isMuted)}
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/15 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all active:scale-95"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-white/40" /> : <Volume2 className="h-4 w-4 text-[#F5CE33]" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP layout: text left, video carousel right ── */}
      <div className="relative z-10 hidden md:flex items-center justify-between px-10 lg:px-14 py-10" style={{ minHeight: 340 }}>
        {/* Left — Copy */}
        <div className="flex-1 max-w-md pr-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 px-4 py-1.5 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#F5CE33] opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F5CE33]" />
            </span>
            <span className="text-[11px] font-black text-[#F5CE33] uppercase tracking-[0.2em]">Promotion Spotlight</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-2">Drop-Worthy</h2>
          <div className="inline-block bg-white/10 border border-white/15 text-white text-4xl lg:text-5xl font-black px-4 py-1 rounded-xl mb-5 tracking-tight">
            Deals & Promos
          </div>
          {activeVideo?.title ? (
            <p className="text-white/70 text-sm lg:text-base leading-relaxed mb-5 max-w-sm">{activeVideo.title}</p>
          ) : (
            <p className="text-white/50 text-sm lg:text-base leading-relaxed mb-5 max-w-sm">Exclusive offers, flash sales, and new drops every week.</p>
          )}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { icon: Zap, label: "Flash Deals", color: "text-[#F5CE33]" },
              { icon: Tag, label: "Best Prices", color: "text-[#0066FF]" },
              { icon: Sparkles, label: "New Arrivals", color: "text-[#F5CE33]" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
                <Icon className={`h-3 w-3 ${color}`} /> {label}
              </div>
            ))}
          </div>
          {displayVideos.length > 1 && (
            <div className="flex items-center gap-2 mb-5">
              {displayVideos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => switchTo(i)}
                  data-testid={`promo-dot-${i}`}
                  className={`transition-all duration-300 rounded-full ${i === activeIdx ? "w-8 h-2 bg-[#F5CE33]" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`}
                />
              ))}
              <span className="ml-2 text-[10px] font-bold text-white/30">{activeIdx + 1} / {displayVideos.length}</span>
            </div>
          )}
          <div className="flex gap-3">
            <Link href="/shop">
              <button data-testid="promo-shop-btn" className="flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white font-black text-sm px-7 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95">
                Shop All Deals <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <button
              data-testid="promo-mute-btn"
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-5 py-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-white/50" /> : <Volume2 className="h-4 w-4 text-[#F5CE33]" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>

        {/* Right — Video carousel with prev/next arrows */}
        <div className="relative flex items-center gap-3 select-none">
          {displayVideos.length > 1 && (
            <button
              onClick={() => switchTo((activeIdx - 1 + displayVideos.length) % displayVideos.length)}
              className="absolute -left-10 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 border border-white/20 p-2 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}
          <div className="flex gap-3 items-center">
            {displayVideos.slice(0, 4).map((vid, i) => {
              const isActive = i === activeIdx;
              const glow = glowColors[i % glowColors.length];
              return (
                <div
                  key={vid.id ?? i}
                  data-testid={`promo-video-${i}`}
                  onClick={() => switchTo(i)}
                  className={`relative cursor-pointer transition-all duration-500 shrink-0 ${isActive ? "scale-100 z-10" : "scale-[0.88] opacity-40"}`}
                  style={{ width: isActive ? "clamp(140px, 18vw, 190px)" : "clamp(80px, 11vw, 120px)" }}
                >
                  {isActive && (
                    <div className={`absolute -inset-2 bg-gradient-to-b ${glow} rounded-[28px] blur-xl opacity-40 pointer-events-none`} />
                  )}
                  <div className="relative rounded-[22px] overflow-hidden border border-white/10 shadow-2xl aspect-[9/16] bg-black">
                    <video
                      ref={el => { videoRefs.current[i] = el; }}
                      src={vid.url}
                      muted={isMuted}
                      playsInline
                      loop={displayVideos.length === 1}
                      onEnded={() => handleEnded(i)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/15" />
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-black/40 border border-white/25 p-2.5 backdrop-blur-sm">
                          <Play className="h-4 w-4 text-white fill-white" />
                        </div>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-wider shadow-lg">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
                        </span>
                      </div>
                    )}
                    {(vid as any).isFeatured && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400/90 shadow-lg">
                          <Sparkles className="h-2.5 w-2.5 text-yellow-900" />
                        </span>
                      </div>
                    )}
                    {vid.title && (
                      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-5 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-[10px] font-black text-white leading-tight line-clamp-2">{vid.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {displayVideos.length > 1 && (
            <button
              onClick={() => switchTo((activeIdx + 1) % displayVideos.length)}
              className="absolute -right-10 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 border border-white/20 p-2 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
    </section>
  );
};
const AudioPreview = () => {
  const { data: products } = useProducts({ category: "Audio" });
  
  if (!products || products.length === 0) return null;

  return (
    <section className="py-5 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold">Audio</h2>
          <Link href="/audio">
            <Button variant="ghost" className="text-primary font-bold">
              See all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {products.slice(0, 6).map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
          </div>
        </Carousel>
      </div>
    </section>
  );
};


const FeaturedSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: slides = [] } = useQuery<any[]>({
    queryKey: ["/api/featured-slides"],
    queryFn: async () => {
      const res = await fetch("/api/featured-slides");
      return res.json();
    },
  });

  const fmtPrice = (v: number) =>
    new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(v);

  const goTo = (idx: number) => {
    if (isAnimating || idx === current) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 300);
  };

  const goNext = () => goTo((current + 1) % slides.length);
  const goPrev = () => goTo((current - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setTimeout(goNext, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section className="w-full py-4 px-3 md:px-6 lg:px-8">
      {/* Preload all slide images to prevent lag when switching */}
      <div className="hidden" aria-hidden="true">
        {slides.map((s: any, i: number) => i !== current && s.imageUrl ? (
          <img key={i} src={s.imageUrl} alt="" />
        ) : null)}
      </div>
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F5CE33 0%, #E8B800 40%, #F5CE33 70%, #FFD700 100%)" }}
      >
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #000 1px, transparent 0)", backgroundSize: "28px 28px" }}
        />

        {/* ── MOBILE layout (stacked: image top, text bottom) ── */}
        <div
          className="relative z-10 flex flex-col md:hidden"
          style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.3s ease" }}
        >
          {/* Image area with rings behind */}
          <div className="relative flex items-center justify-center pt-10 pb-2 px-8" style={{ minHeight: 220 }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-52 w-52 rounded-full border-[28px] border-white/15 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full border-[20px] border-white/10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
            {slide.imageUrl && (
              <img
                src={slide.imageUrl}
                alt={`${slide.titleLine1} ${slide.titleLine2}`}
                className="relative z-10 h-44 w-full object-contain"
                style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.22))" }}
              />
            )}
          </div>

          {/* Text + CTA */}
          <div className="px-6 pb-8 text-center">
            {slide.badge && (
              <span className="inline-block bg-white/90 text-gray-800 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 shadow-sm">
                {slide.badge}
              </span>
            )}
            <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight mb-1">
              {slide.titleLine1}
            </h2>
            <div className="inline-block bg-gray-900 text-yellow-300 text-3xl font-black px-4 py-1 rounded-xl mb-4 tracking-tight">
              {slide.titleLine2}
            </div>
            {slide.price && (
              <p className="text-xl font-black text-gray-900 mb-5 tracking-tight">
                {fmtPrice(slide.price)}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Link href={slide.linkUrl || "/shop"} className="w-full">
                <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-black text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95">
                  <ArrowRight className="h-4 w-4" />
                  View Product
                </button>
              </Link>
              <Link href="/shop" className="w-full">
                <button className="w-full flex items-center justify-center gap-2 bg-transparent text-gray-900 font-bold text-sm px-6 py-3.5 rounded-2xl border-2 border-gray-900/20 transition-all active:scale-95">
                  Shop All
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── DESKTOP layout (side by side) ── */}
        <div
          className="relative z-10 hidden md:flex items-center justify-between h-full px-10 lg:px-14 py-10"
          style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.3s ease", minHeight: 300 }}
        >
          {/* Decorative rings — desktop */}
          <div className="absolute right-[26%] top-1/2 -translate-y-1/2 h-72 w-72 rounded-full border-[32px] border-white/10 pointer-events-none" />
          <div className="absolute right-[26%] top-1/2 -translate-y-1/2 h-52 w-52 rounded-full border-[24px] border-white/10 pointer-events-none" />
          <div className="absolute right-[26%] top-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-white/10 pointer-events-none" />

          {/* Left — Text */}
          <div className="flex-1 max-w-lg pr-6">
            {slide.badge && (
              <span className="inline-block bg-white/90 backdrop-blur text-gray-800 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 shadow-sm">
                {slide.badge}
              </span>
            )}
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-2">
              {slide.titleLine1}
            </h2>
            <div className="inline-block bg-gray-900 text-yellow-300 text-4xl lg:text-5xl font-black px-4 py-1 rounded-xl mb-5 tracking-tight">
              {slide.titleLine2}
            </div>
            {slide.description && (
              <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-5 max-w-sm">
                {slide.description}
              </p>
            )}
            {slide.price && (
              <p className="text-2xl lg:text-3xl font-black text-gray-900 mb-6 tracking-tight">
                {fmtPrice(slide.price)}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Link href={slide.linkUrl || "/shop"}>
                <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95">
                  <ArrowRight className="h-4 w-4" /> View Product
                </button>
              </Link>
              <Link href="/shop">
                <button className="flex items-center gap-2 bg-white/70 hover:bg-white text-gray-900 font-bold text-sm px-6 py-3 rounded-2xl border-2 border-gray-900/10 backdrop-blur transition-all hover:scale-105 active:scale-95">
                  Shop All
                </button>
              </Link>
            </div>
          </div>

          {/* Right — Product image */}
          <div className="relative shrink-0 flex items-center justify-center w-60 lg:w-80 h-60 lg:h-72">
            {slide.imageUrl && (
              <img
                src={slide.imageUrl}
                alt={`${slide.titleLine1} ${slide.titleLine2}`}
                className="h-full w-full object-contain"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.18))" }}
              />
            )}
          </div>
        </div>

        {/* Prev Arrow */}
        {slides.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/80 hover:bg-white backdrop-blur shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ArrowRight className="h-4 w-4 text-gray-900 rotate-180" />
          </button>
        )}

        {/* Next Arrow */}
        {slides.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/80 hover:bg-white backdrop-blur shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ArrowRight className="h-4 w-4 text-gray-900" />
          </button>
        )}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-300 ${idx === current ? "w-6 h-2.5 bg-gray-900" : "w-2.5 h-2.5 bg-gray-900/30 hover:bg-gray-900/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const HomeSectionsDisplay = () => {
  const { data: sections } = useQuery({
    queryKey: ["/api/home-sections"],
    queryFn: async () => {
      const res = await fetch("/api/home-sections");
      if (!res.ok) throw new Error("Failed to fetch sections");
      return res.json();
    },
  });

  const { data: allProducts } = useProducts();

  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section: any) => {
        let productsToShow = allProducts || [];

        if (section.type === "specific_products" && section.productIds && section.productIds.length > 0) {
          productsToShow = section.productIds
            .map((id: number) => productsToShow.find((p: any) => p.id === id))
            .filter(Boolean);
        } else {
          if (section.categoryFilter && section.categoryFilter !== "all") {
            productsToShow = productsToShow.filter((p: any) => p.category === section.categoryFilter);
          }
          productsToShow = productsToShow.slice(0, section.limit || 8);
        }

        if (productsToShow.length === 0) return null;

        return (
          <section key={section.id} className="py-5 sm:py-8 border-b">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-2xl font-bold">{section.title}</h2>
                {section.type !== "specific_products" && (
                  <Link href={section.categoryFilter ? `/products?category=${section.categoryFilter}` : "/products"}>
                    <Button variant="ghost" className="text-primary font-bold">
                      See all <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {productsToShow.map((product: any) => (
                    <CarouselItem key={product.id} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </section>
        );
      })}
    </>
  );
};

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useProducts({ featured: "true" });
  const { data: dealProducts, isLoading: dealsLoading } = useProducts({ category: "Deals" });
  const { data: gamingProducts } = useProducts({ category: "Gaming" });
  const { data: homeProducts } = useProducts({ category: "Home" });
  const { data: smartphoneProducts } = useProducts({ category: "Smartphones" });
  const { data: laptopProducts } = useProducts({ category: "Laptops" });
  const { data: tabletProducts } = useProducts({ category: "Tablets" });
  const { data: watchProducts } = useProducts({ category: "Smartwatches" });
  const { data: audioProducts } = useProducts({ category: "Audio" });

  const popularCategories = [
    { name: "Smartphones", icon: Smartphone, href: "/shop?category=Smartphones" },
    { name: "Laptops", icon: Laptop, href: "/shop?category=Laptops" },
    { name: "Tablets", icon: Tablet, href: "/shop?category=Tablets" },
    { name: "Smartwatches", icon: Watch, href: "/shop?category=Smartwatches" },
    { name: "Gaming", icon: Gamepad2, href: "/gaming" },
    { name: "Audio", icon: Headphones, href: "/shop?category=Audio" },
    { name: "Accessories & Bundles", icon: Wrench, href: "/shop?category=Accessories" },
    { name: "Electronics", icon: Monitor, href: "/shop?category=Electronics" },
    { name: "Vacuum Cleaners", icon: Trash2, href: "/shop?category=Vacuums" },
    { name: "Home & Kitchen", icon: Tv, href: "/home-kitchen" },
  ];

  const orgSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Dopik Electronics",
    "url": "https://dopikelectronics.com",
    "logo": "https://dopikelectronics.com/favicon.ico",
    "description": "Premium electronics retailer in Kigali, Rwanda — smartphones, laptops, audio, gaming gear and more.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kigali",
      "addressCountry": "RW"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+250783562143",
      "contactType": "customer service",
      "availableLanguage": ["English", "French", "Kinyarwanda"]
    },
    "sameAs": []
  });

  const websiteSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Dopik Electronics",
    "url": "https://dopikelectronics.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://dopikelectronics.com/shop?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  });

  return (
    <>
      <Helmet>
        <title>Dopik Electronics – Best Electronics Shop in Kigali, Rwanda</title>
        <meta name="description" content="Shop the latest smartphones, laptops, tablets and certified electronics in Kigali Rwanda. Grade A refurbished devices with 12-month warranty. Trusted since 2019." />
        <meta name="keywords" content="electronics kigali, smartphones rwanda, laptops kigali, iphone kigali, samsung rwanda, dopik electronics, refurbished phones, certified electronics" />
        <meta property="og:title" content="Dopik Electronics – Best Electronics Shop in Kigali" />
        <meta property="og:url" content="https://dopikelectronics.com/" />
        <meta name="google-site-verification" content="HZMexTGNu2r654lO4ndFbX2gaHqrhkQv1GjPIFmurPo" />
        <link rel="canonical" href="https://dopikelectronics.com/" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{orgSchema}</script>
        <script type="application/ld+json">{websiteSchema}</script>
      </Helmet>
      <Navbar />
      <WhatsAppFloat />
      <div className="min-h-screen bg-background text-foreground overflow-x-clip">

        <HomeHero />
        <TrustBar />
        <HomeSectionsDisplay />
        <TopDeals />
        <MaximizeSavings />
        <FeaturedSlider />
        <RecommendedProducts />
        <PopularCategories />
        <CustomerFavorites />
        <HomeProducts />
        <GamingPreview />
        <CircularEconomy />
        <AudioPreview />

        <Footer />
      </div>
    </>
  );
}
