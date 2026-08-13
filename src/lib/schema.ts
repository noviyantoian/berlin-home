import { pgTable, serial, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

/**
 * Leads collected from the WhatsApp order form.
 * `source` is normalized: cpc | organic | social | referral | direct.
 * IP + UTM/gclid are stored for traffic attribution and CPC fraud detection.
 */
export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
    source: varchar("source", { length: 24 }).notNull().default("direct"),
    gclid: text("gclid"),
    utmSource: varchar("utm_source", { length: 120 }),
    utmMedium: varchar("utm_medium", { length: 120 }),
    utmCampaign: varchar("utm_campaign", { length: 160 }),
    referrer: text("referrer"),
    page: varchar("page", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("leads_created_idx").on(t.createdAt),
    index("leads_ip_idx").on(t.ip),
    index("leads_source_idx").on(t.source),
  ]
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

/**
 * Dashboard accounts. `role` gates what a session may see:
 * admin = full access (leads + fraud panel + user management),
 * client = read-only leads view for the spa owner.
 * The bootstrap admin from ADMIN_USER/ADMIN_PASSWORD_HASH lives in env, not here,
 * so the panel can never lock itself out.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 16 }).notNull().default("client"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by", { length: 60 }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
