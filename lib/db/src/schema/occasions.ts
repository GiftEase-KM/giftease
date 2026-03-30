import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const occasionsTable = pgTable("occasions", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id"),
  title: text("title").notNull(),
  date: text("date"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOccasionSchema = createInsertSchema(occasionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOccasion = z.infer<typeof insertOccasionSchema>;
export type Occasion = typeof occasionsTable.$inferSelect;
