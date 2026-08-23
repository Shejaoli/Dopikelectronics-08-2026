import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  totalPrice: number;
  quantity: number;
  storage: string;
  color: string;
  imageUrl: string;
}

export default function Cart() {
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    newCart[index].totalPrice = newCart[index].quantity * newCart[index].price;
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WhatsAppFloat />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-dashed border-border"
          >
            <div className="relative mb-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-20" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" 
              />
            </div>
            <p className="text-xl font-medium text-muted-foreground mb-8">Your cart is feeling a bit light...</p>
            <Link href="/shop">
              <Button size="lg" className="rounded-xl px-8 font-bold">
                Browse Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.productId}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    className="group relative flex gap-6 p-6 bg-card rounded-2xl border border-border hover:shadow-md transition-all"
                  >
                    <div className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-white p-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-contain transition-transform group-hover:scale-110"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-foreground sm:text-xl line-clamp-1">{item.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <span className="bg-muted px-2 py-0.5 rounded">{item.storage}</span>
                            <span className="bg-muted px-2 py-0.5 rounded">{item.color}</span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-primary">{formatPrice(item.totalPrice)}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => updateQuantity(index, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => updateQuantity(index, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg gap-2 font-semibold"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="font-medium">Delivery</span>
                    <span className="font-bold text-green-500">{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button 
                    className="w-full py-6 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                    onClick={() => {
                      localStorage.removeItem("checkout_shipping");
                      setLocation("/checkout/shipping");
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full py-6 text-lg font-bold rounded-2xl border-2 border-primary/10 hover:bg-primary/5 hover:border-primary/20 transition-all"
                    onClick={() => setLocation("/shop")}
                  >
                    Add More Items
                  </Button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Secure checkout via WhatsApp or Direct Order</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
