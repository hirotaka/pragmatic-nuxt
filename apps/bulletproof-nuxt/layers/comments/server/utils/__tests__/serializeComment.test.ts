import type { Comment } from "~comments/shared/types";
import { expect, expectTypeOf, test } from "vitest";
import { serializeComment } from "../serializeComment";

expectTypeOf<Comment["createdAt"]>().toEqualTypeOf<string>();
expectTypeOf<Comment["updatedAt"]>().toEqualTypeOf<string>();

test("serializes repository comment datetimes as ISO strings", () => {
  const createdAt = new Date("2026-07-10T01:02:03.456Z");
  const updatedAt = new Date("2026-07-10T02:03:04.567Z");

  expect(serializeComment({
    id: "comment-1",
    body: "Comment body",
    discussionId: "discussion-1",
    authorId: "user-1",
    createdAt,
    updatedAt,
    author: {
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
    },
  })).toEqual({
    id: "comment-1",
    body: "Comment body",
    discussionId: "discussion-1",
    authorId: "user-1",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    author: {
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
    },
  });
});
