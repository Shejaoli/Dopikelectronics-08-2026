import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ShieldCheck, User, KeyRound, Mail, Fingerprint } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const accountSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: me, isLoading } = useQuery<any>({ queryKey: ["/api/admin/me"] });

  const accountForm = useForm({
    values: {
      username: me?.username || "",
      email: me?.email || "",
    }
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/admin/account", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  });

  const updateProfile = (data: any) => {
    updateMutation.mutate({ username: data.username });
  };

  const updatePassword = (data: any) => {
    updateMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Account & Security</h1>
        <p className="text-muted-foreground font-medium">Manage your administrative profile and security preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                <User className="h-5 w-5 text-primary" /> Profile Settings
              </CardTitle>
              <CardDescription>Update your public administrative identity.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={accountForm.handleSubmit(updateProfile)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="username" className="pl-10 h-11" {...accountForm.register("username")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input value={me?.email} disabled className="pl-10 h-11 bg-muted/50 cursor-not-allowed" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-bold uppercase tracking-widest" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card/50 backdrop-blur overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                <Fingerprint className="h-5 w-5 text-primary" /> Multi-Factor Auth
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="space-y-1">
                  <Label className="text-sm font-bold">2FA Protection</Label>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {me?.twoFactorEnabled ? "Security is active" : "Account is less secure"}
                  </p>
                </div>
                <Switch 
                  checked={me?.twoFactorEnabled} 
                  onCheckedChange={(checked) => updateMutation.mutate({ twoFactorEnabled: checked })}
                  disabled={updateMutation.isPending}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <p className="mt-4 text-[10px] text-muted-foreground italic leading-relaxed">
                When enabled, you'll be required to provide a security code from your authenticator app during login.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
              <KeyRound className="h-5 w-5 text-primary" /> Password Security
            </CardTitle>
            <CardDescription>Keep your account secure with a strong password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(updatePassword)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Password</Label>
                <Input id="currentPassword" type="password" className="h-11" {...passwordForm.register("currentPassword")} placeholder="••••••••" />
              </div>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
                  <Input id="newPassword" type="password" className="h-11" {...passwordForm.register("newPassword")} placeholder="Min. 6 characters" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="h-11" {...passwordForm.register("confirmPassword")} placeholder="Repeat password" />
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full h-11 font-bold uppercase tracking-widest border-2" disabled={updateMutation.isPending}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/30 p-6 rounded-2xl border border-dashed border-border/50">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Account History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Member Since</span>
            <span className="text-sm font-medium">{new Date(me?.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Last Activity</span>
            <span className="text-sm font-medium">{me?.lastLogin ? new Date(me.lastLogin).toLocaleString() : "First session"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
