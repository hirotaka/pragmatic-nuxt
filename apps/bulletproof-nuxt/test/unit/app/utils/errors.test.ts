import { expect, test } from "vitest";
import { extractErrorMessage } from "~/utils/errors";

test.each([
  { label: "response data", error: { data: { message: "Response detail" }, statusMessage: "HTTP summary", message: "Transport summary" }, expected: "Response detail" },
  { label: "status message", error: { data: { message: 42 }, statusMessage: "HTTP summary", message: "Transport summary" }, expected: "HTTP summary" },
  { label: "standard Error", error: new Error("Connection lost"), expected: "Connection lost" },
  { label: "message after an invalid status message", error: { statusMessage: null, message: "Transport summary" }, expected: "Transport summary" },
  { label: "an empty but explicit message", error: { message: "" }, expected: "" },
])("extracts $label without replacing it with the fallback", ({ error, expected }) => {
  expect(extractErrorMessage(error, "Fallback")).toBe(expected);
});

test.each([undefined, null, "failure", 42, {}, { data: null }, { data: { message: false }, message: 42 }])(
  "uses the supplied fallback for an unsupported error: %j",
  (error) => {
    expect(extractErrorMessage(error, "Please try again")).toBe("Please try again");
  },
);
