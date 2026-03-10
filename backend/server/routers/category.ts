import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from  "../../db";
import { categories } from "../../db/schema";
import { TRPCError } from "@trpc/server";

export const categoryRouter = router({

    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            return db.select().from(categories)
                .where(eq(categories.userId, ctx.session.user.id));
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [cat] = await db.select().from(categories)
                .where(and(
                    eq(categories.id, input.id),
                    eq(categories.userId, ctx.session.user.id),
                ));
            if (!cat) throw new TRPCError({ code: "NOT_FOUND" });
            return cat;
        }),

    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            color: z.string().optional(),
            icon: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [cat] = await db.insert(categories)
                .values({ ...input, userId: ctx.session.user.id })
                .returning();
            return cat;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            color: z.string().optional(),
            icon: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            const [updated] = await db.update(categories)
                .set(data)
                .where(and(
                    eq(categories.id, id),
                    eq(categories.userId, ctx.session.user.id),
                ))
                .returning();
            if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
            return updated;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await db.delete(categories)
                .where(and(
                    eq(categories.id, input.id),
                    eq(categories.userId, ctx.session.user.id),
                ));
            return { success: true };
        }),
});
