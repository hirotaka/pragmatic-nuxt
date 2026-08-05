import { beforeEach, expect, test, vi } from "vitest";

const { addNotification, create } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  create: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

beforeEach(() => {
  addNotification.mockReset();
  create.mockReset();
});

test("notifies a transport failure once through onRequestError", async () => {
  let options: Record<string, unknown> | undefined;
  const api = vi.fn();
  create.mockImplementation((value) => {
    options = value;
    return api;
  });
  vi.stubGlobal("$fetch", { create });
  const plugin = (await import("../api")).default;

  const result = await plugin({} as never);
  const onRequestError = options?.onRequestError as (context: {
    error: Error;
    options: { errorNotification?: false };
  }) => void;
  onRequestError({
    error: new Error("Network unavailable"),
    options: {},
  });

  expect(result).toEqual({ provide: { api } });
  expect(addNotification).toHaveBeenCalledOnce();
  expect(addNotification).toHaveBeenCalledWith({
    type: "error",
    title: "Error",
    message: "Network unavailable",
  });
});

test("does not notify intentional request cancellation", async () => {
  let options: {
    onRequestError: (context: {
      error: Error;
      options: Record<string, never>;
    }) => void;
  } | undefined;
  const api = vi.fn((_request: string, requestOptions: { signal: AbortSignal }) => {
    return new Promise((_, reject) => {
      requestOptions.signal.addEventListener("abort", () => {
        const error = new DOMException("Aborted", "AbortError");
        options!.onRequestError({ error, options: {} });
        reject(error);
      }, { once: true });
    });
  });
  create.mockImplementation((value) => {
    options = value as typeof options;
    return api;
  });
  vi.stubGlobal("$fetch", { create });
  const plugin = (await import("../api")).default;
  const result = await plugin({} as never);
  const controller = new AbortController();
  if (!result?.provide) throw new Error("API plugin did not provide a client");

  const request = result.provide.api("/api/comments", { signal: controller.signal });
  controller.abort();

  await expect(request).rejects.toMatchObject({ name: "AbortError" });
  expect(api).toHaveBeenCalledWith("/api/comments", { signal: controller.signal });
  expect(addNotification).not.toHaveBeenCalled();
});

test("keeps $api GET response failures owned by the plugin hook", async () => {
  let options: Record<string, unknown> | undefined;
  create.mockImplementation((value) => {
    options = value;
    return vi.fn();
  });
  vi.stubGlobal("$fetch", { create });
  const plugin = (await import("../api")).default;
  await plugin({} as never);
  const onResponseError = options?.onResponseError as (context: {
    options: { errorNotification?: false };
    response: { _data: { statusCode: number; statusMessage: string; message: string } };
  }) => void;

  onResponseError({
    options: {},
    response: {
      _data: {
        statusCode: 403,
        statusMessage: "Admin access required",
        message: "Admin access required",
      },
    },
  });

  expect(addNotification).toHaveBeenCalledOnce();
  expect(addNotification).toHaveBeenCalledWith({
    type: "error",
    title: "Error",
    message: "Admin access required",
  });
});
