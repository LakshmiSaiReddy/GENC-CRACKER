import { createInsertSchema } from "drizzle-zod";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const workspaceStateTable = pgTable("workspace_state", {
  userId: text("user_id").primaryKey(),
  state: jsonb("state").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertWorkspaceStateSchema = createInsertSchema(
  workspaceStateTable,
).omit({ updatedAt: true });
export type InsertWorkspaceState = z.infer<typeof insertWorkspaceStateSchema>;
export type WorkspaceStateRecord = typeof workspaceStateTable.$inferSelect;