"use client";

import { authClient } from "@/app/api/auth/auth-client";

// Re-export the built-in useSession hook from better-auth
export const useSession = authClient.useSession;
