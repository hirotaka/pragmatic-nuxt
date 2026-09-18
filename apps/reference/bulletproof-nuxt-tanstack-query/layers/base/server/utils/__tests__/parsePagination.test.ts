import { describe, expect, test } from "vitest";
import { parsePagination } from "../parsePagination";

describe("parsePagination", () => {
  test("uses defaults only when pagination parameters are omitted", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10 });
    expect(parsePagination({ page: undefined, limit: undefined })).toEqual({ page: 1, limit: 10 });
  });

  test.each([
    ["both parameters", { page: "2", limit: "25" }, { page: 2, limit: 25 }],
    ["maximum safe page", { page: String(Number.MAX_SAFE_INTEGER) }, { page: Number.MAX_SAFE_INTEGER, limit: 10 }],
    ["maximum limit", { limit: "100" }, { page: 1, limit: 100 }],
  ])("accepts canonical positive integers for %s", (_label, query, expected) => {
    expect(parsePagination(query)).toEqual(expected);
  });

  test.each([
    ["zero", "0"],
    ["negative", "-1"],
    ["decimal", "1.5"],
    ["leading whitespace", " 1"],
    ["trailing whitespace", "1 "],
    ["plus sign", "+1"],
    ["leading zero", "01"],
    ["exponent", "1e2"],
    ["suffix", "1abc"],
    ["empty string", ""],
    ["repeated values", ["1", "2"]],
    ["unsafe integer", String(Number.MAX_SAFE_INTEGER + 1)],
    ["non-string value", 1],
    ["null", null],
  ])("rejects an invalid page: %s", (_label, page) => {
    expect(() => parsePagination({ page })).toThrowError(expect.objectContaining({
      statusCode: 400,
      statusMessage: "Invalid pagination parameters",
    }));
  });

  test.each([
    ["zero", "0"],
    ["negative", "-1"],
    ["decimal", "1.5"],
    ["whitespace", " 10"],
    ["plus sign", "+10"],
    ["leading zero", "010"],
    ["exponent", "1e2"],
    ["suffix", "10items"],
    ["repeated values", ["10", "20"]],
    ["over maximum", "101"],
    ["unsafe integer", String(Number.MAX_SAFE_INTEGER + 1)],
  ])("rejects an invalid limit: %s", (_label, limit) => {
    expect(() => parsePagination({ limit })).toThrowError(expect.objectContaining({
      statusCode: 400,
      statusMessage: "Invalid pagination parameters",
    }));
  });
});
