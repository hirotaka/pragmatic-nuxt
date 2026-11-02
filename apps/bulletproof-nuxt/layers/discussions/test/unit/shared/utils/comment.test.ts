import { expect, test } from "vitest";
import { createCommentInputSchema } from "#layers/discussions/shared/utils/comment";

test("accepts a comment body and strips unrelated fields", () => {
  expect(createCommentInputSchema.parse({ body: "A comment", authorId: "another-user" }))
    .toEqual({ body: "A comment" });
});

test.each(["", undefined])("rejects an empty or missing comment body: %j", (body) => {
  expect(createCommentInputSchema.safeParse({ body })).toMatchObject({
    success: false,
    error: { issues: expect.arrayContaining([expect.objectContaining({ path: ["body"] })]) },
  });
});

test("provides the application message for an empty comment", () => {
  expect(createCommentInputSchema.safeParse({ body: "" })).toMatchObject({
    success: false,
    error: { issues: expect.arrayContaining([expect.objectContaining({ message: "Comment body is required" })]) },
  });
});
