import type { Comment } from "#layers/discussions/shared/types/comment";
import { expect, expectTypeOf, test } from "vitest";
import { serializeComment } from "../../../../server/utils/serializeComment";

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
    createdAt: "2026-07-10T01:02:03.456Z",
    updatedAt: "2026-07-10T02:03:04.567Z",
    author: {
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
    },
  });
});
