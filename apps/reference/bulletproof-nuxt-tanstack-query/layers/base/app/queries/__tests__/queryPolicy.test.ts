import { expect, test } from "vitest";
import {
  authenticatedQueryMeta,
  isAuthenticatedQuery,
} from "../queryPolicy";

test("identifies authenticated queries from their metadata", () => {
  expect(isAuthenticatedQuery({
    queryKey: ["discussions", "list"],
    meta: authenticatedQueryMeta(),
  } as never)).toBe(true);
  expect(isAuthenticatedQuery({ queryKey: ["public"], meta: undefined } as never)).toBe(false);
});
