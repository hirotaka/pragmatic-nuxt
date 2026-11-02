import { expect } from "vitest";
import { setupRepositoryTests } from "#layers/discussions/test/support/repository";

const test = setupRepositoryTests();
const input = { title: "Updated title", body: "Updated body" };

// Matching scope.

test("update returns true and changes only the matching discussion", async ({ db, repositories, records }) => {
  const { discussion } = records;
  const before = await db.query.discussions.findMany();

  const updated = await repositories.discussions.update(discussion.id, discussion.teamId, input);

  expect(updated).toBe(true);
  expect(await db.query.discussions.findMany()).toEqual(before.map(row => row.id === discussion.id
    ? { ...row, ...input, updatedAt: expect.any(Date) }
    : row));
});

test("delete returns true and removes only the matching discussion and its comments", async ({ db, repositories, records }) => {
  const { discussion, otherDiscussion, otherComment } = records;

  const deleted = await repositories.discussions.delete(discussion.id, discussion.teamId);

  expect(deleted).toBe(true);
  expect(await db.query.discussions.findMany()).toEqual([otherDiscussion]);
  expect(await db.query.comments.findMany()).toEqual([otherComment]);
});

// Mismatched scope.

test.for(["update", "delete"] as const)("%s returns false for another team and leaves stored rows unchanged", async (operation, { db, repositories, records }) => {
  const before = await db.query.discussions.findMany();
  const commentsBefore = await db.query.comments.findMany();

  const changed = operation === "update"
    ? await repositories.discussions.update(records.discussion.id, records.otherTeam.id, input)
    : await repositories.discussions.delete(records.discussion.id, records.otherTeam.id);

  expect(changed).toBe(false);
  expect(await db.query.discussions.findMany()).toEqual(before);
  expect(await db.query.comments.findMany()).toEqual(commentsBefore);
});

// Missing resources.

test.for(["update", "delete"] as const)("%s returns false for a missing discussion and leaves stored rows unchanged", async (operation, { db, repositories, records }) => {
  const before = await db.query.discussions.findMany();
  const commentsBefore = await db.query.comments.findMany();

  const changed = operation === "update"
    ? await repositories.discussions.update("missing", records.team.id, input)
    : await repositories.discussions.delete("missing", records.team.id);

  expect(changed).toBe(false);
  expect(await db.query.discussions.findMany()).toEqual(before);
  expect(await db.query.comments.findMany()).toEqual(commentsBefore);
});
