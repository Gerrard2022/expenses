import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/backend/db";
import * as schema from "@/backend/db/schema";
import { dash } from "@better-auth/infra";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            currency: {
                type: "string",
                defaultValue: "USD",
            },
        },
    },
    plugins: [
        dash()
    ]
});
