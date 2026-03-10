import {
  pgTable, text, numeric, boolean,
  timestamp, pgEnum
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income", "expense", "saving", "credit", "debt",
]);

export const debtCreditStatusEnum = pgEnum("debt_credit_status", [
  "pending", "partially_paid", "paid",
]);

// ─── Better Auth Tables ───────────────────────────────────
export const users = pgTable("users", {
  id:            text("id").primaryKey(),        // Better Auth uses text IDs
  name:          text("name").notNull(),
  email:         text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image:         text("image"),
  currency:      text("currency").default("USD"),
  createdAt:     timestamp("created_at").defaultNow(),
  updatedAt:     timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token:     text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id:                    text("id").primaryKey(),
  userId:                text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId:            text("provider_id").notNull(),
  accountId:             text("account_id").notNull(),
  accessToken:           text("access_token"),
  refreshToken:          text("refresh_token"),
  accessTokenExpiresAt:  timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope:                 text("scope"),
  idToken:               text("id_token"),
  password:              text("password"),        // hashed — Better Auth manages this
  createdAt:             timestamp("created_at").defaultNow(),
  updatedAt:             timestamp("updated_at").defaultNow(),
});

export const verifications = pgTable("verifications", {
  id:         text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").defaultNow(),
});

// ─── App Tables ───────────────────────────────────────────
export const categories = pgTable("categories", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name:      text("name").notNull(),
  color:     text("color"),
  icon:      text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:     text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  type:       transactionTypeEnum("type").notNull(),
  name:       text("name").notNull(),
  amount:     numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date:       timestamp("date").notNull(),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
});

export const savings = pgTable("savings", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:        text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name:          text("name").notNull(),
  targetAmount:  numeric("target_amount", { precision: 12, scale: 2 }),
  currentAmount: numeric("current_amount", { precision: 12, scale: 2 }).default("0"),
  deadline:      timestamp("deadline"),
  isCompleted:   boolean("is_completed").default(false),
  createdAt:     timestamp("created_at").defaultNow(),
  updatedAt:     timestamp("updated_at").defaultNow(),
});

export const debtsCredits = pgTable("debts_credits", {
  id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:     text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:       transactionTypeEnum("type").notNull(),
  personName: text("person_name").notNull(),
  amount:     numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0"),
  status:     debtCreditStatusEnum("status").default("pending"),
  dueDate:    timestamp("due_date"),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
});

// ─── Types ────────────────────────────────────────────────
export type User         = InferSelectModel<typeof users>;
export type Category     = InferSelectModel<typeof categories>;
export type NewCategory  = InferInsertModel<typeof categories>;
export type Transaction  = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;
export type Saving       = InferSelectModel<typeof savings>;
export type NewSaving    = InferInsertModel<typeof savings>;
export type DebtCredit   = InferSelectModel<typeof debtsCredits>;
export type NewDebtCredit = InferInsertModel<typeof debtsCredits>;
