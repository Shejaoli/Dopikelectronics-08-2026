import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, MessageCircle, PhoneCall } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Link } from "wouter";

export function Footer() {
  const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent("Hello DOPIK, I have a question about your products.")}`;

  return (
    <footer className="border-t border-border bg-card pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand & Mission */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground tracking-tighter">
                DOPIK <span className="text-primary">ELECTRONICS</span>
              </h3>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                Where Gadgets Meet Great Deals. Your premium destination for the latest certified electronics in Kigali, Rwanda.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="https://instagram.com/dopik.electronics" target="_blank" className="rounded-full bg-accent/50 p-2.5 text-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-accent/50 p-2.5 text-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-accent/50 p-2.5 text-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/"><span className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors">Home</span></Link></li>
              <li><Link href="/shop"><span className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors">Shop All Products</span></Link></li>
              <li><Link href="/deals"><span className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors">Hot Deals</span></Link></li>
              <li><Link href="/about"><span className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors">Our Story</span></Link></li>
              <li><Link href="/contact"><span className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors">Customer Support</span></Link></li>
            </ul>
          </div>

          {/* Direct Contact & Location */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Visit & Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Physical Store</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">KN 48 St, Kigali, Rwanda<br/>(3335+6Q Kigali)</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 rounded-full bg-green-500/10 p-2 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <SiWhatsapp className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">WhatsApp Sales</span>
                  <a href={whatsappUrl} target="_blank" className="text-xs text-muted-foreground hover:text-green-600 transition-colors">
                    +250 783 562 143
                  </a>
                  <a href={`https://wa.me/250789527746?text=${encodeURIComponent("Hello DOPIK, I have a question about your products.")}`} target="_blank" className="text-xs text-muted-foreground hover:text-green-600 transition-colors">
                    +250 789 527 746
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 rounded-full bg-blue-500/10 p-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Call Us</span>
                  <a href="tel:+250783562143" className="text-xs text-muted-foreground hover:text-blue-600 transition-colors">+250 783 562 143</a>
                  <a href="tel:+250789527746" className="text-xs text-muted-foreground hover:text-blue-600 transition-colors">+250 789 527 746</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Email Inquiry</span>
                  <span className="text-xs text-muted-foreground truncate">dopikelectronics@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Shop Hours */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Store Hours</h4>
            <div className="rounded-2xl bg-accent/30 p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Mon - Fri:</span>
                <span className="text-foreground font-bold">8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Saturday:</span>
                <span className="text-foreground font-bold">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Sunday:</span>
                <span className="text-foreground font-bold text-red-500">Closed</span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 pt-2 border-t border-border mt-2">
                *Times are in CAT (GMT+2)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground/50 font-medium">
          <p>&copy; {new Date().getFullYear()} DOPIK ELECTRONICS. All rights reserved. &mdash; Powered by <span className="font-semibold">YSOTA LTD</span></p>
          <div className="flex gap-6">
            <span className="hover:text-primary cursor-default">Privacy Policy</span>
            <span className="hover:text-primary cursor-default">Terms of Service</span>
            <span className="hover:text-primary cursor-default tracking-widest uppercase">Shevio</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
