import type { Database } from "@praha/drizzle-factory";
import { randomUUID } from "node:crypto";
import { comments } from "@nuxthub/db/schema";
import { defineFactory } from "@praha/drizzle-factory";

type CommentDefaults = Pick<typeof comments.$inferInsert, "discussionId" | "authorId">;

export function commentFactory(db: Database<{ comments: typeof comments }>, defaults: CommentDefaults) {
  return defineFactory({
    schema: { comments },
    table: "comments",
    resolver: () => ({
      id: randomUUID(),
      body: "Test comment",
      discussionId: defaults.discussionId,
      authorId: defaults.authorId,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
  })(db);
}
