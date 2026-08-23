import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Package, Calendar, MapPin, Hash, Phone, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";

const trackSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  phone: z.string().min(1, "Phone number is required"),
});

type TrackForm = z.infer<typeof trackSchema>;

export default function TrackOrder() {
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<TrackForm>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      orderId: "",
      phone: "",
    },
  });

  const trackMutation = useMutation({
    mutationFn: async (values: TrackForm) => {
      // Remove '#' if user added it
      const cleanId = values.orderId.replace("#", "").trim();
      const res = await apiRequest("GET", `/api/orders/public/track?id=${cleanId}&phone=${values.phone}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Tracking failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        setOrder(data);
        setNotFound(false);
      } else {
        setOrder(null);
        setNotFound(true);
      }
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "confirmed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "paid": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "delivered": return "bg-primary/10 text-primary border-primary/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Track Your Order</h1>
            <p className="text-muted-foreground text-lg">
              Enter your Order ID and Phone Number to see your order status.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => trackMutation.mutate(data))} className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="e.g. 123" {...field} className="pl-9 h-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="0788XXXXXX" {...field} className="pl-9 h-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="sm:col-span-2 h-12 text-lg font-bold mt-2"
                    disabled={trackMutation.isPending}
                  >
                    {trackMutation.isPending ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" /> Track Order
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {notFound && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6 text-center text-destructive font-medium">
                Order not found. Please check your Order ID and Phone Number.
              </CardContent>
            </Card>
          )}

          {order && (
            <Card className="overflow-hidden shadow-lg border-2 border-primary/10">
              <CardHeader className="bg-muted/50 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Package className="h-6 w-6 text-primary" />
                      Order #{order.id}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(order.createdAt), "PPP p")}
                    </div>
                  </div>
                  <Badge variant="outline" className={`px-4 py-1 text-sm font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Delivery Details
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-muted-foreground">{order.customerPhone}</p>
                      <p className="text-muted-foreground">{order.deliveryLocation}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Payment Info
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                      <p className="text-muted-foreground">Method: <span className="text-foreground font-medium">{order.paymentMethod}</span></p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Items Ordered</h3>
                  <div className="space-y-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border/50">
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x {item.storage ? `• ${item.storage}` : ""} {item.color ? `• ${item.color}` : ""}
                          </p>
                        </div>
                        <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
