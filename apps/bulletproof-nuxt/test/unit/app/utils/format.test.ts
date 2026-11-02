import { expect, test } from "vitest";
import { formatDate } from "~/utils/format";

test.each([
  { date: new Date(2026, 0, 2, 0, 5), expected: "January 2, 2026 12:05 AM" },
  { date: new Date(2026, 6, 10, 12, 9), expected: "July 10, 2026 12:09 PM" },
  { date: "2026-12-31T23:59:00", expected: "December 31, 2026 11:59 PM" },
])("formats $expected in local time", ({ date, expected }) => {
  expect(formatDate(date)).toBe(expected);
});

test("formats the date explicitly supplied by the caller", () => {
  const date = new Date(2026, 9, 15, 8, 30);

  expect(formatDate(date)).toBe("October 15, 2026 8:30 AM");
});

test.each([undefined, null, "not-a-date"])("returns Invalid Date for missing or invalid input: %j", (date) => {
  expect(formatDate(date)).toBe("Invalid Date");
});
