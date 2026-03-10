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
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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

            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors mt-2"
            >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? "Light mode" : "Dark mode"}
            </button>
        </aside>
    );
}
