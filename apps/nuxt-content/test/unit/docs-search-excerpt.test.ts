import { expect, it } from "vitest";
import { searchExcerpt } from "../../app/utils/docs-search-excerpt";

it("normalizes whitespace without interpreting markup", () => {
  expect(searchExcerpt("  Literal\n<img src=x>  text  ", "LITERAL")).toBe("Literal <img src=x> text");
});

it("keeps a late case-insensitive match in a bounded excerpt", () => {
  const excerpt = searchExcerpt(`${"before ".repeat(40)}bodyneedle ${"after ".repeat(50)}`, "BODYNEEDLE");
  expect(excerpt.indexOf("bodyneedle")).toBe(61);
  expect(excerpt.startsWith("…")).toBe(true);
  expect(excerpt.endsWith("…")).toBe(true);
  expect(excerpt.slice(1, -1)).toHaveLength(180);
});
