import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Product } from "@shared/schema";
import { Search, Flame, Shield, Truck, SlidersHorizontal, Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";

export default function Deals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("All Deals");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000000]);

  const { data: hotDeals, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/hot-deals"],
  });

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "name": "Dopik Electronics",
    "url": "https://dopikelectronics.com",
    "telephone": "+250783562143",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "KN 48 St",
      "addressLocality": "Kigali",
      "addressCountry": "RW"
    }
  };

  const filteredDeals = (hotDeals || []).filter(p => {
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.brand.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (category !== "All Deals" && p.category !== category) return false;
    if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    return true;
  });

  const availableCategories = ["All Deals", ...Array.from(new Set((hotDeals || []).map(p => p.category)))];
  const categories = availableCategories;
  const brands = Array.from(new Set((hotDeals || []).map(p => p.brand))).sort();

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Categories</h3>
        <div className="space-y-2">
          {categories.slice(1).map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox 
                id={cat} 
                checked={category === cat}
                onCheckedChange={() => setCategory(cat)}
              />
              <label htmlFor={cat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {cat}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox 
                id={brand} 
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => {
                  setSelectedBrands(prev => 
                    checked ? [...prev, brand] : prev.filter(b => b !== brand)
                  );
                }}
              />
              <label htmlFor={brand} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Price Range</h3>
        <PriceRangeSlider
          value={priceRange}
          onChange={setPriceRange}
          max={5000000}
          step={1000}
          className="mt-2"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Hot Deals on Electronics | Dopik Electronics Rwanda</title>
        <meta name="description" content="Shop exclusive deals on certified refurbished iPhones, laptops, gaming consoles and more in Rwanda. Save up to 60% off. Limited time offers with 1-year warranty." />
        <meta property="og:title" content="Hot Deals on Electronics | Dopik Electronics" />
        <meta property="og:description" content="Exclusive deals on certified refurbished gadgets in Kigali. Save big on phones, laptops, gaming gear and more." />
        <meta property="og:url" content="https://dopikelectronics.com/deals" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hot Deals on Electronics | Dopik Electronics" />
        <meta name="twitter:description" content="Exclusive deals on certified refurbished gadgets in Kigali. Save big on phones, laptops, gaming gear and more." />
        <link rel="canonical" href="https://dopikelectronics.com/deals" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      </Helmet>
      <Navbar />
      <WhatsAppFloat />

      {/* Hero Deals Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-16 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1 text-sm font-bold text-primary backdrop-blur-md border border-primary/20">
              <Flame className="h-4 w-4" />
              HOT DEALS
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Hot Deals</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Limited time offers on refurbished tech. Save up to 40% on top brands.
            </p>
            
            {(hotDeals || []).length > 0 && (
              <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(hotDeals || []).slice(0, 3).map((deal) => {
                  const discount = deal.hotDealDiscount || 0;
                  const originalPrice = discount > 0 ? Math.round(deal.price / (1 - discount / 100)) : deal.price;
                  return (
                    <div key={deal.id} className="group relative overflow-hidden rounded-2xl bg-white/6 p-6 transition-all hover:bg-white/10 glass-panel">
                      {discount > 0 && (
                        <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg">Save {discount}%</span>
                      )}
                      <div className="mb-4 aspect-square h-32 w-full">
                        <img src={deal.imageUrl} alt={deal.name} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
                      </div>
                      <h3 className="font-bold text-white">{deal.name}</h3>
                      <div className="mt-2 flex items-center gap-3">
                        {discount > 0 && <span className="text-sm text-slate-400 line-through">{originalPrice.toLocaleString()} RWF</span>}
                        <span className="text-lg font-black text-primary">{deal.price.toLocaleString()} RWF</span>
                      </div>
                      <Button className="mt-4 w-full rounded-xl font-bold">Shop Now</Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="sticky top-[112px] z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-bold transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          
          {/* Sidebar Desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-40 space-y-8">
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between rounded-xl py-6 font-bold">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filters
                  </span>
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
                <div className="py-8">
                  <h2 className="mb-8 text-2xl font-black">Filters</h2>
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3 lg:grid-cols-5 xl:grid-cols-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No deals found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3 lg:grid-cols-5 xl:grid-cols-6">
                {filteredDeals.map((product) => (
                  <ProductCard key={product.id} product={product} isDeal={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-muted/30 py-20 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black tracking-tight">Premium Refurbished. Trusted Quality.</h2>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Warranty Included</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Quality Tested</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold">Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
