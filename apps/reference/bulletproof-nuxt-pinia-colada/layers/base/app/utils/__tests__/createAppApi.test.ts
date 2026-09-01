import { beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createAppApi } from "../createAppApi";

const { createMock, requestHeaders } = vi.hoisted(() => ({
  createMock: vi.fn(),
  requestHeaders: vi.fn(),
}));

vi.mock("#imports", async importOriginal => ({
  ...await importOriginal<typeof import("#imports")>(),
  $fetch: { create: createMock },
}));
vi.mock("#build/fetch.mjs", () => ({ $fetch: { create: createMock } }));
mockNuxtImport("useRequestHeaders", () => requestHeaders);

beforeEach(() => {
  createMock.mockReset().mockReturnValue("api-client");
  requestHeaders.mockReset().mockReturnValue({ cookie: "session-a" });
});

test.runIf(import.meta.client)("configures client transport defaults", () => {
  expect(createAppApi()).toBe("api-client");

  const options = createMock.mock.calls[0]?.[0] as {
    headers: unknown;
    retry: number;
    onRequest: (context: { request: string }) => void;
  };
  expect(options.headers).toBeUndefined();
  expect(options.retry).toBe(0);
  expect(requestHeaders).not.toHaveBeenCalled();

  options.onRequest({ request: "/api/users" });
});

test.runIf(import.meta.server)("isolates forwarded cookies between server request clients", () => {
  createMock.mockImplementation(options => ({ options }));
  requestHeaders
    .mockReturnValueOnce({ cookie: "session-a" })
    .mockReturnValueOnce({ cookie: "session-b" });

  const clientA = createAppApi();
  const clientB = createAppApi();
  const optionsA = createMock.mock.calls[0]?.[0] as {
    headers: unknown;
    retry: number;
    onRequest: (context: { request: unknown }) => void;
  };
  const optionsB = createMock.mock.calls[1]?.[0] as typeof optionsA;

  expect(clientA).not.toBe(clientB);
  expect(optionsA.headers).toEqual({ cookie: "session-a" });
  expect(optionsB.headers).toEqual({ cookie: "session-b" });
  expect(optionsA.headers).not.toBe(optionsB.headers);
  expect(optionsA.retry).toBe(0);
  expect(optionsB.retry).toBe(0);
  expect(requestHeaders).toHaveBeenNthCalledWith(1, ["cookie"]);
  expect(requestHeaders).toHaveBeenNthCalledWith(2, ["cookie"]);

  optionsA.onRequest({ request: "/api/users" });
  expect(() => optionsA.onRequest({ request: "https://example.com" })).toThrow();
  expect(() => optionsB.onRequest({ request: "/not-api" })).toThrow();
});

test("rejects external and non-API destinations before sending credentials", () => {
  createAppApi();
  const options = createMock.mock.calls[0]?.[0] as {
    onRequest: (context: { request: unknown }) => void;
  };

  expect(() => options.onRequest({ request: "https://example.com" })).toThrow();
  expect(() => options.onRequest({ request: "//example.com/api/users" })).toThrow();
  expect(() => options.onRequest({ request: "/not-api" })).toThrow();
});
