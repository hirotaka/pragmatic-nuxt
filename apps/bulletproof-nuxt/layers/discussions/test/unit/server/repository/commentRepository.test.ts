import { expect } from "vitest";
import { setupRepositoryTests } from "#layers/discussions/test/support/repository";

const test = setupRepositoryTests();

// Matching scope.

test("delete returns true and removes only the comment in the matching discussion", async ({ db, repositories, records }) => {
  const discussionsBefore = await db.query.discussions.findMany();

  const deleted = await repositories.comments.delete(records.comment.id, records.discussion.id);

  expect(deleted).toBe(true);
  expect(await db.query.comments.findMany()).toEqual([records.otherComment]);
  expect(await db.query.discussions.findMany()).toEqual(discussionsBefore);
});

// Mismatched scope.

test("delete returns false for another discussion and leaves stored rows unchanged", async ({ db, repositories, records }) => {
  const before = await db.query.comments.findMany();
  const discussionsBefore = await db.query.discussions.findMany();

  const deleted = await repositories.comments.delete(records.comment.id, records.otherDiscussion.id);

  expect(deleted).toBe(false);
  expect(await db.query.comments.findMany()).toEqual(before);
  expect(await db.query.discussions.findMany()).toEqual(discussionsBefore);
});

// Missing resources.

test("delete returns false for a missing comment and leaves stored rows unchanged", async ({ db, repositories, records }) => {
  const before = await db.query.comments.findMany();
  const discussionsBefore = await db.query.discussions.findMany();

  const deleted = await repositories.comments.delete("missing", records.discussion.id);

  expect(deleted).toBe(false);
  expect(await db.query.comments.findMany()).toEqual(before);
  expect(await db.query.discussions.findMany()).toEqual(discussionsBefore);
});
