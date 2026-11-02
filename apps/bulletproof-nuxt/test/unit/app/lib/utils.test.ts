import { expect, test } from "vitest";
import { cn } from "~/lib/utils";

test("combines strings, nested arrays, and conditional classes", () => {
  expect(cn("flex", ["items-center", [false, "gap-2"]], { "hidden": false, "font-bold": true }, null, undefined))
    .toBe("flex items-center gap-2 font-bold");
});

test("lets later conflicting utilities override earlier utilities", () => {
  expect(cn("px-2 py-1 text-sm", "px-4 text-lg")).toBe("py-1 px-4 text-lg");
});

test("keeps independent responsive and state variants", () => {
  expect(cn("p-2 md:p-4 hover:bg-red-500", "p-3 hover:bg-blue-500"))
    .toBe("md:p-4 p-3 hover:bg-blue-500");
});

test("returns an empty class string without active inputs", () => {
  expect(cn()).toBe("");
  expect(cn(false, null, undefined, { hidden: false })).toBe("");
});
