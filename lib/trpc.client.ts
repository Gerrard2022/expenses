import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/backend/server/root";

export const trpc = createTRPCReact<AppRouter>();
