import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const giftsTable = pgTable("gifts", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id"),
  occasionId: integer("occasion_id"),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  url: text("url"),
  purchased: boolean("purchased").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGiftSchema = createInsertSchema(giftsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGift = z.infer<typeof insertGiftSchema>;
export type Gift = typeof giftsTable.$inferSelect;
