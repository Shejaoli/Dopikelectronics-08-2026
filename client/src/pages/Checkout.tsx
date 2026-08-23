import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, MessageCircle, Truck, CreditCard as CardIcon, Wallet, Calendar as CalendarIcon, Clock, Package, ArrowLeft, ArrowRight, ChevronRight, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { SiVisa, SiMastercard } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertOrderSchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

// Shipping schema
const shippingSchema = z.object({
  email: z.string().email("Invalid email address"),
  updates: z.boolean().default(false),
  country: z.string().default("Rwanda"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Shipping address is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province / State is required"),
  phone: z.string().min(1, "Phone number is required"),
});

type ShippingForm = z.infer<typeof shippingSchema>;

function CheckoutForm({ 
  cart, 
  shippingData, 
  total, 
  formatPrice, 
  setLocation, 
  setCreatedOrder 
}: { 
  cart: any[], 
  shippingData: any, 
  total: number, 
  formatPrice: (p: number) => string,
  setLocation: (l: string) => void,
  setCreatedOrder: (o: any) => void
}) {
  const { toast } = useToast();
  const [showMomoInstructions, setShowMomoInstructions] = useState(false);

  const paymentForm = useForm({
    defaultValues: {
      paymentMethod: "Cash on Delivery",
      orderType: "Delivery",
      orderDate: undefined as Date | undefined,
      orderTime: "",
      orderNotes: "",
    },
  });

  const watchPaymentMethod = paymentForm.watch("paymentMethod");
  const watchOrderType = paymentForm.watch("orderType");
  const watchOrderDate = paymentForm.watch("orderDate");
  const watchOrderTime = paymentForm.watch("orderTime");

  const isOrderDetailsComplete = !!watchOrderType && !!watchOrderDate && !!watchOrderTime;

  const orderMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/orders", values);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place order");
      }
      return res.json();
    },
    onSuccess: (order, variables) => {
      setCreatedOrder(order);
      if (variables.paymentMethod === "WhatsApp Order Confirmation") {
        const message = `Hello DOPIK ELECTRONICS, my name is ${shippingData?.firstName} ${shippingData?.lastName}. I've placed order #${order.id} via WhatsApp.\n\nItems:\n${cart.map((item: any) => `- ${item.quantity}x ${item.name} (${item.storage}, ${item.color}) - ${formatPrice(item.price)}`).join("\n")}\n\nTotal: ${formatPrice(total)}\n\nShipping Address: ${shippingData?.address}, ${shippingData?.city}, ${shippingData?.province}\nPhone: ${shippingData?.phone}`;
        const whatsappUrl = `https://wa.me/250783562143?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      }
      
      if (variables.paymentMethod === "MomoPay") {
        setShowMomoInstructions(true);
      } else {
        localStorage.removeItem("cart");
        localStorage.removeItem("checkout_shipping");
        setLocation("/order-success");
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Order failed",
        description: error.message,
      });
    },
  });

  const onPaymentSubmit = async (data: any) => {
    if (!shippingData) {
      setLocation("/checkout/shipping");
      return;
    }

    try {
      const orderData = {
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerPhone: shippingData.phone,
        customerEmail: shippingData.email,
        deliveryLocation: `${shippingData.address}, ${shippingData.city}, ${shippingData.province}`,
        orderType: data.orderType,
        orderDate: data.orderDate ? format(data.orderDate, "PPP") : null,
        orderTime: data.orderTime,
        orderNotes: data.orderNotes,
        paymentMethod: data.paymentMethod,
        totalAmount: total,
        status: "pending",
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          storage: item.storage,
          color: item.color
        })),
      };

      orderMutation.mutate(orderData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: error.message,
      });
    }
  };

  if (showMomoInstructions) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-8 p-8 bg-card rounded-3xl border border-border shadow-2xl"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Complete Your Payment</h2>
          <p className="text-muted-foreground">Please follow these steps to complete your MomoPay transaction.</p>
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">Step 1: Dial</p>
              <p className="font-bold text-xl text-primary">*182*1*1*0788865247#</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">Step 2: Enter Amount</p>
              <p className="font-bold text-xl text-primary">{formatPrice(total)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">Step 3: Verify Name</p>
              <p className="font-bold text-lg">Check If the name is Correct: <span className="text-primary">David TUYISHIME</span></p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">4</div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">Step 4: Confirm</p>
              <p className="font-bold text-lg">Confirm Payment.</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-sm font-medium">
            Your order will be processed once the payment is successfully received. Thank you for using Mobile Money Payment!
          </p>
        </div>

        <Separator />

        <div className="space-y-6">
          <h3 className="font-black uppercase tracking-tighter text-xl">Order details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">
              <span>Product</span>
              <span>Total</span>
            </div>
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="font-medium">{item.name} × {item.quantity}</span>
                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-bold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xl font-black">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 pt-4 text-sm border-t">
              <span className="text-muted-foreground">Payment method:</span>
              <span className="font-bold text-right">Mobile Money Payment</span>
              
              <span className="text-muted-foreground">{watchOrderType} Date:</span>
              <span className="font-bold text-right">{watchOrderDate ? format(watchOrderDate, "MMMM d, yyyy") : "N/A"}</span>
              
              <span className="text-muted-foreground">{watchOrderType} Time:</span>
              <span className="font-bold text-right">{watchOrderTime}</span>
            </div>
          </div>

          <div className="pt-6 border-t space-y-2">
            <h3 className="font-black uppercase tracking-tighter text-xl">Billing address</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold text-lg">{shippingData?.firstName} {shippingData?.lastName}</p>
              <p className="text-muted-foreground">{shippingData?.address}</p>
              <p className="text-muted-foreground">{shippingData?.city}, {shippingData?.province}</p>
              <p className="text-muted-foreground font-medium">{shippingData?.phone}</p>
              <p className="text-primary font-bold">{shippingData?.email}</p>
            </div>
          </div>
        </div>

        <Link href="/order-success">
          <Button className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover-elevate active-elevate-2" onClick={() => {
            localStorage.removeItem("cart");
            localStorage.removeItem("checkout_shipping");
          }}>
            I've Completed Payment
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <Form {...paymentForm}>
      <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Shipping Information</h2>
              </div>
              <Link href="/checkout/shipping" className="text-sm font-bold underline hover:text-primary transition-colors">
                Change
              </Link>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground ml-7">
              <p className="font-bold text-foreground text-lg">{shippingData?.firstName} {shippingData?.lastName}</p>
              <p>{shippingData?.email}</p>
              <p>{shippingData?.address}{shippingData?.apartment ? `, ${shippingData.apartment}` : ""}, {shippingData?.city} {shippingData?.province}</p>
              <p className="font-bold text-foreground">{shippingData?.phone}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Order Preferences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={paymentForm.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm uppercase tracking-widest">Order Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-2 focus:ring-primary">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Delivery">Delivery</SelectItem>
                        <SelectItem value="Pickup">Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-bold text-sm uppercase tracking-widest">{watchOrderType} Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-12 rounded-xl border-2 text-left font-normal focus:ring-primary",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="orderTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm uppercase tracking-widest">{watchOrderType} Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-2 focus:ring-primary">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</SelectItem>
                        <SelectItem value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</SelectItem>
                        <SelectItem value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={paymentForm.control}
              name="orderNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-sm uppercase tracking-widest">Order notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notes about your order, e.g. special notes for delivery." 
                      className="min-h-[100px] rounded-xl border-2 focus:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Payment Method</h2>
            <p className="text-sm text-muted-foreground">All transactions are secure and encrypted.</p>
          </div>
          
          <FormField
            control={paymentForm.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col gap-4"
                  >
                    <FormItem className="flex items-start space-x-4 space-y-0 rounded-2xl border-2 border-border p-6 cursor-pointer hover:bg-accent/5 transition-colors data-[state=checked]:border-primary">
                      <FormControl>
                        <RadioGroupItem value="Cash on Delivery" className="mt-1" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-bold text-lg flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" />
                          Cash on Delivery
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">Pay with cash when your order is delivered to your doorstep.</p>
                      </div>
                    </FormItem>

                    <FormItem className="flex items-start space-x-4 space-y-0 rounded-2xl border-2 border-border p-6 cursor-pointer hover:bg-accent/5 transition-colors data-[state=checked]:border-primary">
                      <FormControl>
                        <RadioGroupItem value="WhatsApp Order Confirmation" className="mt-1" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-bold text-lg flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-[#25D366]" />
                          WhatsApp Order Confirmation
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">Send your order details to us on WhatsApp for manual confirmation and payment instructions.</p>
                      </div>
                    </FormItem>

                    <FormItem className="flex flex-col rounded-2xl border-2 border-border overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors data-[state=checked]:border-primary">
                      <div className="flex items-start space-x-4 p-6">
                        <FormControl>
                          <RadioGroupItem value="MomoPay" className="mt-1" />
                        </FormControl>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="font-bold text-lg flex items-center gap-2">
                              <Wallet className="h-5 w-5 text-primary" />
                              MomoPay
                            </FormLabel>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MTN_Logo.svg/1200px-MTN_Logo.svg.png" alt="MTN Momo" className="h-6 object-contain" />
                          </div>
                          <p className="text-sm text-muted-foreground">Pay using Mobile Money (0788865247). Quick and secure mobile payments.</p>
                        </div>
                      </div>
                    </FormItem>

                    <FormItem className="flex flex-col rounded-2xl border-2 border-border overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors data-[state=checked]:border-primary">
                      <div className="flex items-start space-x-4 p-6">
                        <FormControl>
                          <RadioGroupItem value="Card Payment" className="mt-1" />
                        </FormControl>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="font-bold text-lg flex items-center gap-2">
                              <CardIcon className="h-5 w-5 text-primary" />
                              Card Payment
                            </FormLabel>
                            <div className="flex gap-2">
                              <SiVisa className="h-5 w-8 text-[#1A1F71]" />
                              <SiMastercard className="h-5 w-8 text-[#EB001B]" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Secure payment using your credit or debit card.</p>
                        </div>
                      </div>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          {!isOrderDetailsComplete && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <CalendarIcon className="h-5 w-5" />
              <p className="text-sm font-bold">
                Please select {watchOrderType} date and time to continue
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setLocation("/checkout/shipping")}
              className="flex-1 py-8 text-lg font-bold rounded-2xl border-2 hover:bg-accent"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={orderMutation.isPending || !isOrderDetailsComplete}
              className="flex-[2] py-8 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
            >
              {orderMutation.isPending ? "Processing..." : (watchPaymentMethod === "WhatsApp Order Confirmation" ? "Complete on WhatsApp" : "Pay Now")}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground font-medium">
            🔒 Secure transaction. Your data is protected by industry-standard encryption.
          </p>
        </div>
      </form>
    </Form>
  );
}

function CheckoutShipping({ 
  shippingForm, 
  onNext 
}: { 
  shippingForm: any, 
  onNext: (data: ShippingForm) => void 
}) {
  return (
    <Form {...shippingForm}>
      <form onSubmit={shippingForm.handleSubmit(onNext)} className="space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-bold">Contact</h2>
              <FormField
                control={shippingForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" className="h-12 rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={shippingForm.control}
                name="updates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Send me order updates
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 space-y-4 pt-4">
              <h2 className="text-xl font-bold">Delivery</h2>
              <FormField
                control={shippingForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-2">
                          <SelectValue placeholder="Country/Region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={shippingForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="First Name" className="h-12 rounded-xl border-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={shippingForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Last Name" className="h-12 rounded-xl border-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={shippingForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Shipping Address" className="h-12 rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={shippingForm.control}
                name="apartment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Apartment / Unit (optional)" className="h-12 rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={shippingForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="City" className="h-12 rounded-xl border-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={shippingForm.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Province" className="h-12 rounded-xl border-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={shippingForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Phone Number" className="h-12 rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full py-8 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover-elevate active-elevate-2 uppercase tracking-tighter">
          Continue to Payment
          <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </form>
    </Form>
  );
}

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingData, setShippingData] = useState<ShippingForm | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const { data: customer, isLoading: customerLoading } = useQuery<any>({
    queryKey: ["/api/customer/me"],
    queryFn: async () => {
      const res = await fetch("/api/customer/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 30000,
  });

  const shippingForm = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      email: "",
      updates: false,
      country: "Rwanda",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      province: "",
      phone: "",
    },
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0 && location !== "/order-success") {
        setLocation("/shop");
      }
      setCart(parsedCart);
    } else if (location !== "/order-success") {
      setLocation("/shop");
    }

    const savedShipping = localStorage.getItem("checkout_shipping");
    if (savedShipping) {
      const parsed = JSON.parse(savedShipping);
      setShippingData(parsed);
      shippingForm.reset(parsed);
    }
  }, [location, setLocation]);

  // Auto-fill shipping form from customer account when no saved shipping
  useEffect(() => {
    if (customer && !localStorage.getItem("checkout_shipping")) {
      const nameParts = (customer.fullName || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      shippingForm.reset({
        email: customer.email || "",
        phone: customer.phone || "",
        firstName,
        lastName,
        updates: false,
        country: "Rwanda",
        address: "",
        apartment: "",
        city: "",
        province: "",
      });
    }
  }, [customer]);

  const onShippingSubmit = (data: ShippingForm) => {
    localStorage.setItem("checkout_shipping", JSON.stringify(data));
    setShippingData(data);
    setLocation("/checkout/payment");
  };

  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(price);
  };

  const isPaymentStep = location === "/checkout/payment";

  // Auth gate — must be logged in to checkout
  if (!customerLoading && !customer) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tighter">Sign in to checkout</h1>
              <p className="text-muted-foreground text-base">
                You need an account to place an order. Your details will be pre-filled at checkout.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href={`/login?redirect=${encodeURIComponent(location)}`}>
                <Button className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
              <Link href={`/register?redirect=${encodeURIComponent(location)}`}>
                <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Already in your cart? No worries — items are saved.
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black tracking-tighter uppercase">Checkout</h1>
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
                <ChevronRight className="h-4 w-4" />
                <span className={cn(!isPaymentStep && "text-foreground", isPaymentStep && "hover:text-primary cursor-pointer")} onClick={() => isPaymentStep && setLocation("/checkout/shipping")}>Information</span>
                <ChevronRight className="h-4 w-4" />
                <span className={cn(isPaymentStep ? "text-foreground" : "text-muted-foreground")}>Payment</span>
              </div>
            </div>

            {isPaymentStep ? (
              <CheckoutForm 
                cart={cart}
                shippingData={shippingData}
                total={total}
                formatPrice={formatPrice}
                setLocation={setLocation}
                setCreatedOrder={setCreatedOrder}
              />
            ) : (
              <CheckoutShipping 
                shippingForm={shippingForm} 
                onNext={onShippingSubmit} 
              />
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
                <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  Order Summary
                </h2>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-muted">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-center min-w-0">
                        <h3 className="text-sm font-bold truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">{item.storage} / {item.color}</p>
                        <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4 pt-8 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-500 font-bold uppercase tracking-widest text-[10px] bg-green-500/10 px-2 py-1 rounded-full">Calculated at next step</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black tracking-tight">Total</span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground uppercase font-black tracking-widest block">Amount due</span>
                      <span className="text-3xl font-black tracking-tighter text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-primary/5 p-6 border border-primary/10">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Need help with your order?</p>
                    <p className="text-xs text-muted-foreground">Chat with our support team on WhatsApp for immediate assistance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
