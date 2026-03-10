"use client";

import { trpc } from "@/lib/trpc.client";
import {
    User,
    Mail,
    Settings,
    CreditCard,
    Save,
    LogOut,
    Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authClient } from "@/app/api/auth/auth-client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const { data: user, refetch } = trpc.user.me.useQuery();
    const updateProfile = trpc.user.update.useMutation({
        onSuccess: () => refetch(),
    });

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await updateProfile.mutateAsync({
            name: formData.get("name") as string,
            currency: formData.get("currency") as string,
        });
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/api/auth/signin"); // Or wherever the login page is
    };

    return (
        <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Settings</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Manage your personal information and preferences.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="text-destructive hover:text-destructive">
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Sign out
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Header Card */}
                <Card className="lg:col-span-1">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4 relative group">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-muted-foreground" />
                            )}
                            <button className="absolute bottom-0 right-0 p-1.5 bg-background border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-3 h-3 text-muted-foreground" />
                            </button>
                        </div>
                        <CardTitle className="text-lg">{user?.name || "User"}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-1.5 mt-1">
                            <Mail className="w-3 h-3" />
                            {user?.email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 border-t divide-y">
                        <div className="py-3 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Account Status</span>
                            <span className="font-medium text-emerald-600 bg-emerald-50 content-[''] px-2 py-0.5 rounded-full text-[10px]">Active</span>
                        </div>
                        <div className="py-3 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Currency</span>
                            <span className="font-medium">{user?.currency || "USD"}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Profile Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-base font-medium">Personal Information</CardTitle>
                        </div>
                        <CardDescription>Update your display name and regional settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="prof-name">Full Name</Label>
                                    <Input id="prof-name" name="name" defaultValue={user?.name} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="prof-currency">Default Currency</Label>
                                    <select id="prof-currency" name="currency" defaultValue={user?.currency || "USD"} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="JPY">JPY (¥)</option>
                                        <option value="CHF">CHF (₣)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                                    <Save className="w-4 h-4 mr-1.5" />
                                    {updateProfile.isPending ? "Saving..." : "Save changes"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Security/Plan Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-base font-medium">Subscription & Plan</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border">
                        <div>
                            <p className="text-sm font-medium">Free Plan</p>
                            <p className="text-xs text-muted-foreground mt-0.5">You are currently using the limited free version.</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>Upgrade</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
