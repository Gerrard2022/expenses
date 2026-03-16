"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Receipt,
    PiggyBank,
    HandCoins,
    ListTree,
    User,
    Sun,
    Moon,
    LogOut,
    Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-session";
import { authClient } from "@/app/api/auth/auth-client";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Receipt, label: "Transactions", href: "/transactions" },
    { icon: ListTree, label: "Categories", href: "/categories" },
    { icon: PiggyBank, label: "Savings", href: "/savings" },
    { icon: HandCoins, label: "Debt & Credit", href: "/debt-credit" },
    { icon: User, label: "Profile", href: "/profile" },
];

export function NavContent({ onItemClick }: { onItemClick?: () => void }) {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
    };

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/auth");
    };

    return (
        <div className="flex flex-col h-full py-4 px-2">
            {/* Logo */}
            <div className="flex items-center gap-2 px-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-base font-bold tracking-tight">ExpensWise</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onItemClick}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-2 pt-4">
                <Separator className="mb-2" />
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {isDark ? "Light mode" : "Dark mode"}
                </button>

                {session?.user && (
                    <div className="mt-2 p-2.5 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                            {session.user.image ? (
                                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{session.user.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function SideNav() {
    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 border-r border-border bg-card flex-col z-50">
            <NavContent />
        </aside>
    );
}
