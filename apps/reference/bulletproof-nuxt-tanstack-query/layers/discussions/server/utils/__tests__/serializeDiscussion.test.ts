import type { Discussion } from "~discussions/shared/types";
import { expect, expectTypeOf, test } from "vitest";
import { serializeDiscussion } from "../serializeDiscussion";

expectTypeOf<Discussion["createdAt"]>().toEqualTypeOf<string>();
expectTypeOf<Discussion["updatedAt"]>().toEqualTypeOf<string>();

test("serializes a repository discussion into the exact public DTO with ISO datetimes", () => {
  const createdAt = new Date("2026-07-10T01:02:03.456Z");
  const updatedAt = new Date("2026-07-10T02:03:04.567Z");
  const discussion = {
    id: "discussion-1",
    title: "A discussion",
    body: "Discussion body",
    authorId: "user-1",
    teamId: "team-1",
    createdAt,
    updatedAt,
    author: {
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
    },
    serverOnly: "not-public",
  };

  expect(serializeDiscussion(discussion)).toEqual({
    id: "discussion-1",
    title: "A discussion",
    body: "Discussion body",
    authorId: "user-1",
    teamId: "team-1",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    author: {
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
    },
  });
});
