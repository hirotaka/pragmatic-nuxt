import type { Database } from "@praha/drizzle-factory";
import { randomUUID } from "node:crypto";
import { discussions } from "@nuxthub/db/schema";
import { defineFactory } from "@praha/drizzle-factory";

type DiscussionDefaults = Pick<typeof discussions.$inferInsert, "authorId" | "teamId">;

export function discussionFactory(db: Database<{ discussions: typeof discussions }>, defaults: DiscussionDefaults) {
  return defineFactory({
    schema: { discussions },
    table: "discussions",
    resolver: () => ({
      id: randomUUID(),
      title: "Test discussion",
      body: "Test discussion body",
      authorId: defaults.authorId,
      teamId: defaults.teamId,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
  })(db);
}
