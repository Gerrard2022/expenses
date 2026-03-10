import { initTRPC, TRPCError } from "@trpc/server";
import type { Session, User } from "better-auth";

// ─── Context ──────────────────────────────────────────────
// Better Auth gives us the full session object, not just userId
export type Context = {
    session: { user: User; session: Session } | null;
};

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: { session: ctx.session },  // session.user.id is now non-null
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
