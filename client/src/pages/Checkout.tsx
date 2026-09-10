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
import { CheckCircle2, MessageCircle, Truck, CreditCard as CardIcon, Wallet, Calendar as CalendarIcon, Clock, Package, ArrowLeft, ArrowRight, ChevronRight, LogIn, UserPlus, ShieldCheck, Copy, MapPin } from "lucide-react";
import { SiVisa, SiMastercard } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertOrderSchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PROVINCES, DISTRICTS_BY_PROVINCE, KIGALI_SECTORS_BY_DISTRICT, isKigaliDistrict } from "@shared/rwanda-locations";

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

// Delivery/pickup time slots, with 24-hour end times used to detect passed slots
const TIME_SLOTS = [
  { value: "09:00 AM - 12:00 PM", endHour: 12, endMinute: 0 },
  { value: "12:00 PM - 03:00 PM", endHour: 15, endMinute: 0 },
  { value: "03:00 PM - 06:00 PM", endHour: 18, endMinute: 0 },
  { value: "06:00 PM - 09:00 PM", endHour: 21, endMinute: 0 },
];

function isTimeSlotPast(slot: { endHour: number; endMinute: number }, selectedDate: Date | undefined) {
  if (!selectedDate) return false;
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();
  if (!isToday) return false;
  const slotEnd = new Date(selectedDate);
  slotEnd.setHours(slot.endHour, slot.endMinute, 0, 0);
  return now >= slotEnd;
}

// Mobile Money networks: dial code to pay DOPIK's merchant number, and the
// phone number prefixes customers must pay from on each network.
const MOMO_NETWORKS: Record<string, { dialCode: string; prefixes: string[] }> = {
  "MTN Mobile Money": { dialCode: "*182*1*1*0788865247#", prefixes: ["078", "079"] },
  "Airtel Money": { dialCode: "*182*1*2*0788865247#", prefixes: ["072", "073"] },
};

function isMomoNetwork(method: string): method is keyof typeof MOMO_NETWORKS {
  return method === "MTN Mobile Money" || method === "Airtel Money";
}

function validateMomoPhone(value: string, network: string): string {
  const digits = value.replace(/\D/g, "");
  const config = MOMO_NETWORKS[network];
  if (!config) return "";
  if (digits.length !== 10 || !config.prefixes.some((p) => digits.startsWith(p))) {
    return `Enter a valid ${network} number starting with ${config.prefixes.join(" or ")} (10 digits)`;
  }
  return "";
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
  province: z.string().min(1, "Province / City is required"),
  district: z.string().min(1, "District is required"),
  sector: z.string().optional(),
  cell: z.string().optional(),
  landmark: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
}).superRefine((data, ctx) => {
  if (isKigaliDistrict(data.district) && !data.sector) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sector"],
      message: "Sector is required for Kigali",
    });
  }
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

  const watchOrderType = paymentForm.watch("orderType");
  const watchOrderDate = paymentForm.watch("orderDate");
  const watchOrderTime = paymentForm.watch("orderTime");
  const watchPaymentMethod = paymentForm.watch("paymentMethod");

  const isOrderDetailsComplete = !!watchOrderType && !!watchOrderDate && !!watchOrderTime;

  // Mobile Money: collect and validate the customer's own paying-from number
  const [momoPhone, setMomoPhone] = useState("");
  const [momoInput, setMomoInput] = useState("");
  const [momoError, setMomoError] = useState("");
  const [momoDialogOpen, setMomoDialogOpen] = useState(false);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState("");

  useEffect(() => {
    if (!isMomoNetwork(watchPaymentMethod)) return;
    if (momoPhone && !validateMomoPhone(momoPhone, watchPaymentMethod)) return;
    if (!momoPhone) {
      setMomoInput("");
      setMomoError("");
      setMomoDialogOpen(true);
    } else if (validateMomoPhone(momoPhone, watchPaymentMethod)) {
      setMomoPhone("");
      setMomoInput("");
      setMomoError("");
      setMomoDialogOpen(true);
    }
  }, [watchPaymentMethod]);

  const handleMomoConfirm = () => {
    const err = validateMomoPhone(momoInput, watchPaymentMethod);
    if (err) {
      setMomoError(err);
      return;
    }
    setMomoPhone(momoInput.replace(/\D/g, ""));
    setMomoDialogOpen(false);
  };

  const handleMomoDialogChange = (open: boolean) => {
    setMomoDialogOpen(open);
    if (!open && !momoPhone) {
      paymentForm.setValue("paymentMethod", "Cash on Delivery");
    }
  };

  // If the selected time slot has since passed (e.g. date changed to today, or time elapsed), clear it
  useEffect(() => {
    if (!watchOrderTime) return;
    const slot = TIME_SLOTS.find((s) => s.value === watchOrderTime);
    if (slot && isTimeSlotPast(slot, watchOrderDate)) {
      paymentForm.setValue("orderTime", "");
    }
  }, [watchOrderDate, watchOrderTime]);

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

      if (isMomoNetwork(variables.paymentMethod)) {
        setConfirmedPaymentMethod(variables.paymentMethod);
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

    if (isMomoNetwork(data.paymentMethod) && !momoPhone) {
      setMomoDialogOpen(true);
      return;
    }

    try {
      const locationParts = [shippingData.sector, shippingData.district, shippingData.province].filter(Boolean);
      const deliveryLocation = `${shippingData.address}${shippingData.cell ? `, ${shippingData.cell} Cell` : ""}, ${locationParts.join(", ")}${shippingData.landmark ? ` (Near: ${shippingData.landmark})` : ""}`;

      const orderData = {
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerPhone: shippingData.phone,
        customerEmail: shippingData.email,
        deliveryLocation,
        deliveryProvince: shippingData.province,
        deliveryDistrict: shippingData.district,
        deliverySector: shippingData.sector || null,
        deliveryCell: shippingData.cell || null,
        deliveryLandmark: shippingData.landmark || null,
        orderType: data.orderType,
        orderDate: data.orderDate ? format(data.orderDate, "PPP") : null,
        orderTime: data.orderTime,
        orderNotes: data.orderNotes,
        paymentMethod: data.paymentMethod,
        paymentProvider: isMomoNetwork(data.paymentMethod) ? data.paymentMethod : null,
        paymentReference: isMomoNetwork(data.paymentMethod) ? momoPhone : null,
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
          <p className="text-muted-foreground">Please follow these steps to complete your {confirmedPaymentMethod || "Mobile Money"} transaction.</p>
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">Step 1: Dial</p>
              <p className="font-bold text-xl text-primary">{MOMO_NETWORKS[confirmedPaymentMethod]?.dialCode || MOMO_NETWORKS["MTN Mobile Money"].dialCode}</p>
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
              <p className="text-muted-foreground">{[shippingData?.sector, shippingData?.district, shippingData?.province].filter(Boolean).join(", ")}</p>
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
              <p>{shippingData?.address}{shippingData?.apartment ? `, ${shippingData.apartment}` : ""}, {[shippingData?.sector, shippingData?.district, shippingData?.province].filter(Boolean).join(", ")}</p>
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
                          disabled={(date) => {
                            const startOfToday = new Date();
                            startOfToday.setHours(0, 0, 0, 0);
                            return date < startOfToday || date < new Date("1900-01-01");
                          }}
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
                        {TIME_SLOTS.map((slot) => {
                          const passed = isTimeSlotPast(slot, watchOrderDate);
                          return (
                            <SelectItem key={slot.value} value={slot.value} disabled={passed}>
                              {slot.value}{passed ? " (Passed)" : ""}
                            </SelectItem>
                          );
                        })}
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

                    <FormItem className="flex flex-col rounded-2xl border-2 border-border overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors data-[state=checked]:border-primary">
                      <div className="flex items-start space-x-4 p-6">
                        <FormControl>
                          <RadioGroupItem value="MTN Mobile Money" className="mt-1" />
                        </FormControl>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="font-bold text-lg flex items-center gap-2">
                              <Wallet className="h-5 w-5 text-primary" />
                              MTN Mobile Money
                            </FormLabel>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MTN_Logo.svg/1200px-MTN_Logo.svg.png" alt="MTN Momo" className="h-6 object-contain" />
                          </div>
                          <p className="text-sm text-muted-foreground">Pay using MTN Mobile Money. Quick and secure mobile payments.</p>
                          {watchPaymentMethod === "MTN Mobile Money" && momoPhone && (
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm font-bold text-primary">Paying from: {momoPhone}</p>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setMomoInput(momoPhone); setMomoError(""); setMomoDialogOpen(true); }}
                                className="text-xs underline text-muted-foreground hover:text-foreground"
                              >
                                Change
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormItem>

                    <FormItem className="flex flex-col rounded-2xl border-2 border-border overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors data-[state=checked]:border-primary">
                      <div className="flex items-start space-x-4 p-6">
                        <FormControl>
                          <RadioGroupItem value="Airtel Money" className="mt-1" />
                        </FormControl>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="font-bold text-lg flex items-center gap-2">
                              <Wallet className="h-5 w-5 text-primary" />
                              Airtel Money
                            </FormLabel>
                          </div>
                          <p className="text-sm text-muted-foreground">Pay using Airtel Money. Quick and secure mobile payments.</p>
                          {watchPaymentMethod === "Airtel Money" && momoPhone && (
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm font-bold text-primary">Paying from: {momoPhone}</p>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setMomoInput(momoPhone); setMomoError(""); setMomoDialogOpen(true); }}
                                className="text-xs underline text-muted-foreground hover:text-foreground"
                              >
                                Change
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormItem>

                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Dialog open={momoDialogOpen} onOpenChange={handleMomoDialogChange}>
            <DialogContent className="max-w-sm rounded-2xl">
              <DialogHeader>
                <DialogTitle>Enter your {isMomoNetwork(watchPaymentMethod) ? watchPaymentMethod : ""} number</DialogTitle>
                <DialogDescription>
                  This is the number you'll pay from. We use it to match your payment to your order.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="078XXXXXXX"
                  value={momoInput}
                  onChange={(e) => { setMomoInput(e.target.value); setMomoError(""); }}
                  className="text-lg font-bold"
                  autoFocus
                />
                {momoError && <p className="text-sm text-destructive font-medium">{momoError}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => handleMomoDialogChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleMomoConfirm}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              disabled={orderMutation.isPending || !isOrderDetailsComplete || (isMomoNetwork(watchPaymentMethod) && !momoPhone)}
              className="flex-[2] py-8 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
            >
              {orderMutation.isPending ? "Processing..." : "Pay Now"}
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
  onNext,
  deliveryFees
}: { 
  shippingForm: any, 
  onNext: (data: ShippingForm) => void,
  deliveryFees?: { sector: string; fee: number }[]
}) {
  const watchProvince = shippingForm.watch("province");
  const watchDistrict = shippingForm.watch("district");
  const watchSector = shippingForm.watch("sector");
  const districtOptions = watchProvince ? DISTRICTS_BY_PROVINCE[watchProvince] || [] : [];
  const sectorOptions = watchDistrict && isKigaliDistrict(watchDistrict) ? KIGALI_SECTORS_BY_DISTRICT[watchDistrict] || [] : [];
  const showSectorAndCell = !!watchDistrict && isKigaliDistrict(watchDistrict);
  const selectedSectorFee = watchSector ? deliveryFees?.find((f) => f.sector === watchSector)?.fee : undefined;

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
              name="province"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      shippingForm.setValue("district", "");
                      shippingForm.setValue("sector", "");
                      shippingForm.setValue("cell", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="Select Province / City" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={shippingForm.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      shippingForm.setValue("sector", "");
                      shippingForm.setValue("cell", "");
                    }}
                    value={field.value}
                    disabled={!watchProvince}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districtOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showSectorAndCell && (
              <FormField
                control={shippingForm.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-2">
                          <SelectValue placeholder="Select Sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sectorOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {showSectorAndCell && (
              <FormField
                control={shippingForm.control}
                name="cell"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Cell (optional)" className="h-12 rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="md:col-span-2">
              <FormField
                control={shippingForm.control}
                name="landmark"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Nearby known place (optional) — e.g. next to a school, church, market" className="h-12 rounded-xl border-2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {watchProvince && (
              <div className="md:col-span-2 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-sm">
                {watchProvince === "Kigali City" ? (
                  selectedSectorFee !== undefined ? (
                    <>
                      <p className="font-bold text-foreground">🚚 Delivery Fee: {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(selectedSectorFee)}</p>
                      <p className="text-muted-foreground mt-1">This is the standard delivery fee for your selected sector and will be added to your order total.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-foreground">🚚 Delivery Fee: Negotiable with the deliverer</p>
                      <p className="text-muted-foreground mt-1">Select your sector above to see the exact delivery fee.</p>
                    </>
                  )
                ) : (
                  <>
                    <p className="font-bold text-foreground">🚚 Delivery Fee: Based on transportation service</p>
                    <p className="text-muted-foreground mt-1">Delivery fee depends on the transportation service/fare to your location. The final delivery cost will be communicated and confirmed before delivery.</p>
                  </>
                )}
              </div>
            )}
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

function OrderConfirmation({ order, formatPrice }: { order: any; formatPrice: (p: number) => string }) {
  const { toast } = useToast();

  const copyTrackingCode = () => {
    if (!order?.trackingCode) return;
    navigator.clipboard.writeText(order.trackingCode);
    toast({ title: "Copied", description: "Tracking code copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center space-y-4 mb-10">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Order Placed Successfully!</h1>
            <p className="text-muted-foreground text-base">
              Thank you{order?.customerName ? `, ${order.customerName}` : ""}. We've received your order and will be in touch shortly.
            </p>
          </div>

          {order?.trackingCode && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-6 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Your Tracking Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black tracking-[0.2em] text-primary">{order.trackingCode}</span>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={copyTrackingCode} data-testid="button-copy-tracking-code">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Save this code — use it with your phone number on the{" "}
                <Link href="/track-order" className="underline font-bold text-foreground">Track Order</Link> page to check your order status anytime.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            {order?.items?.length > 0 && (
              <div className="space-y-3">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x {item.storage ? `• ${item.storage}` : ""} {item.color ? `• ${item.color}` : ""}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-primary">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <Separator />
              </div>
            )}
            {order?.deliveryFee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Delivery Fee</span>
                <span className="font-bold">{formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-black text-lg">Total</span>
              <span className="font-black text-2xl text-primary">{formatPrice(order?.totalAmount || 0)}</span>
            </div>
            {order?.deliveryLocation && (
              <div className="flex items-start gap-2 pt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{order.deliveryLocation}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href="/track-order" className="flex-1">
              <Button variant="outline" className="w-full h-12 font-bold rounded-2xl">Track Your Order</Button>
            </Link>
            <Link href="/shop" className="flex-1">
              <Button className="w-full h-12 font-bold rounded-2xl">Continue Shopping</Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingData, setShippingData] = useState<ShippingForm | null>(null);
  const [guestContinue, setGuestContinue] = useState(false);
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
      province: "",
      district: "",
      sector: "",
      cell: "",
      landmark: "",
      phone: "",
    },
  });

  useEffect(() => {
    const isOrderSuccessRoute = location === "/order-success" || location === "/order/success";
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0 && !isOrderSuccessRoute) {
        setLocation("/shop");
      }
      setCart(parsedCart);
    } else if (!isOrderSuccessRoute) {
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
        province: "",
        district: "",
        sector: "",
        cell: "",
        landmark: "",
      });
    }
  }, [customer]);

  const onShippingSubmit = (data: ShippingForm) => {
    localStorage.setItem("checkout_shipping", JSON.stringify(data));
    setShippingData(data);
    setLocation("/checkout/payment");
  };

  const { data: deliveryFeesData } = useQuery<{ sector: string; fee: number }[]>({
    queryKey: ["/api/delivery-fees"],
    queryFn: async () => {
      const res = await fetch("/api/delivery-fees");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60000,
  });

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = shippingData?.sector
    ? (deliveryFeesData?.find((f) => f.sector === shippingData.sector)?.fee ?? 0)
    : 0;
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(price);
  };

  const isPaymentStep = location === "/checkout/payment";
  const isOrderSuccess = location === "/order-success" || location === "/order/success";

  if (isOrderSuccess) {
    if (createdOrder) {
      return <OrderConfirmation order={createdOrder} formatPrice={formatPrice} />;
    }
    // Direct visit or page refresh with no order in memory — point them to Track Order instead of a blank form
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20 text-center">
          <div className="max-w-md space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Order details unavailable here</h1>
            <p className="text-muted-foreground">
              If you just placed an order, check your tracking code and phone number on the Track Order page.
            </p>
            <Link href="/track-order">
              <Button className="h-12 px-8 font-bold rounded-2xl">Track Your Order</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Auth gate — offer sign-in benefits, but let guests continue too
  if (!customerLoading && !customer && !guestContinue) {
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
              <h1 className="text-3xl font-black tracking-tighter">Sign in to checkout faster</h1>
              <p className="text-muted-foreground text-base">
                Your details will be pre-filled at checkout — or continue as a guest.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-accent/20 p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">Track your orders anytime from your account</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">Faster checkout next time — details saved</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">See your full order history and reorder easily</span>
              </div>
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
              <Button
                variant="ghost"
                className="w-full h-12 text-base font-semibold rounded-2xl"
                onClick={() => setGuestContinue(true)}
                data-testid="button-continue-guest"
              >
                Continue as Guest
              </Button>
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
                deliveryFees={deliveryFeesData}
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
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Shipping</span>
                    {shippingData?.sector ? (
                      <span>{formatPrice(deliveryFee)}</span>
                    ) : (
                      <span className="text-green-500 font-bold uppercase tracking-widest text-[10px] bg-green-500/10 px-2 py-1 rounded-full">Calculated at next step</span>
                    )}
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
