import { pgTableCreator, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `fuest_${name}`);

export const users = createTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
});

export const accounts = createTable("account", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

// Composite primary key
export const accountsIndex = {
  compoundKey: ["provider", "providerAccountId"] as const,
};

export const sessions = createTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = createTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
});


export const verificationTokensIndex = {
  compoundKey: ["identifier", "token"] as const,
};


export const tokens = createTable("token", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  address: text("address").notNull().unique(),
  abi: text("abi").notNull(),
});

export type Token = typeof tokens.$inferSelect;