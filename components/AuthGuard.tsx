"use client";

import { useSession } from "@/lib/auth-session";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Wraps the app shell (sidebar + content).
 * If the user is NOT authenticated, redirects to /auth.
 * Shows a loading spinner while the session is being resolved.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't redirect if we're still loading, or already on the auth page
        if (isPending || pathname.startsWith("/auth")) return;

        if (!session) {
            router.replace("/auth");
        }
    }, [session, isPending, pathname, router]);

    // Still resolving session
    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading…</span>
                </div>
            </div>
        );
    }

    // Not authenticated and not on auth page → show nothing while redirect fires
    if (!session && !pathname.startsWith("/auth")) {
        return null;
    }

    return <>{children}</>;
}
