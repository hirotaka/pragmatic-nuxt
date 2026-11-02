import { describe, expect, test } from "vitest";
import { createDiscussionInputSchema, updateDiscussionInputSchema } from "#layers/discussions/shared/utils/discussion";

describe("createDiscussionInputSchema", () => {
  test("accepts the required title and body and strips unrelated fields", () => {
    expect(createDiscussionInputSchema.parse({ title: "Title", body: "Body", authorId: "another-user" }))
      .toEqual({ title: "Title", body: "Body" });
  });

  test.each(["title", "body"])("rejects an empty or missing %s", (field) => {
    for (const value of ["", undefined]) {
      expect(createDiscussionInputSchema.safeParse({ title: "Title", body: "Body", [field]: value })).toMatchObject({
        success: false,
        error: { issues: expect.arrayContaining([expect.objectContaining({ path: [field] })]) },
      });
    }
  });
});

describe("updateDiscussionInputSchema", () => {
  test.each([{}, { title: "Updated" }, { body: "Updated body" }, { title: "Updated", body: "Updated body" }])(
    "accepts optional fields: %j",
    (input) => {
      expect(updateDiscussionInputSchema.parse(input)).toEqual(input);
    },
  );

  test.each(["title", "body"])("rejects an explicitly empty %s", (field) => {
    expect(updateDiscussionInputSchema.safeParse({ [field]: "" })).toMatchObject({
      success: false,
      error: { issues: expect.arrayContaining([expect.objectContaining({ path: [field], message: "Required" })]) },
    });
  });
});
