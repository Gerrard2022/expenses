import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { users } from "../../db/schema";
import { TRPCError } from "@trpc/server";
import { auth } from "../../lib/auth";

export const userRouter = router({

    // GET — current user's profile
    me: protectedProcedure
        .query(async ({ ctx }) => {
            const [user] = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    image: users.image,
                    currency: users.currency,
                    createdAt: users.createdAt,
                })
                .from(users)
                .where(eq(users.id, ctx.session.user.id));

            if (!user) throw new TRPCError({ code: "NOT_FOUND" });
            return user;  // password never exposed — it's in accounts table now
        }),

    // POST — register (delegated to Better Auth)
    // Call auth.api.signUpEmail() on the client directly,
    // or expose it here as a thin wrapper
    register: publicProcedure
        .input(z.object({
            name: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(8),
            currency: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            // Better Auth handles hashing + account creation
            const result = await auth.api.signUpEmail({
                body: {
                    name: input.name,
                    email: input.email,
                    password: input.password,
                },
            });

            // Set custom currency field after user is created
            if (input.currency && result.user) {
                await db.update(users)
                    .set({ currency: input.currency })
                    .where(eq(users.id, result.user.id));
            }

            return { success: true, userId: result.user?.id };
        }),

    // PUT — update profile (non-auth fields)
    update: protectedProcedure
        .input(z.object({
            name: z.string().min(1).optional(),
            image: z.string().url().optional(),
            currency: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [updated] = await db
                .update(users)
                .set({ ...input, updatedAt: new Date() })
                .where(eq(users.id, ctx.session.user.id))
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    image: users.image,
                    currency: users.currency,
                });

            if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
            return updated;
        }),

    // DELETE — delete account (cascades all user data)
    delete: protectedProcedure
        .mutation(async ({ ctx }) => {
            await db.delete(users).where(eq(users.id, ctx.session.user.id));
            return { success: true };
        }),
});
