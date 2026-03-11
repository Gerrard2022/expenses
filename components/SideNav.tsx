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
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-session";
import { authClient } from "@/app/api/auth/auth-client";
import { useRouter } from "next/navigation";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Receipt, label: "Transactions", href: "/transactions" },
    { icon: ListTree, label: "Categories", href: "/categories" },
    { icon: PiggyBank, label: "Savings", href: "/savings" },
    { icon: HandCoins, label: "Debt & Credit", href: "/debt-credit" },
    { icon: User, label: "Profile", href: "/profile" },
];

export function SideNav() {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
    };

    const { data: session } = useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/auth");
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-60 border-r border-border bg-background flex flex-col py-6 px-3 z-50">
            {/* Logo */}
            <div className="flex items-center gap-2 px-3 mb-6">
                <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-semibold tracking-tight">ExpensWise</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                isActive
                                    ? "bg-secondary text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            )}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-border">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {isDark ? "Light mode" : "Dark mode"}
                </button>

                {session?.user && (
                    <div className="mt-2 p-2 rounded-lg bg-secondary/30 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                            {session.user.image ? (
                                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{session.user.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Log out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
