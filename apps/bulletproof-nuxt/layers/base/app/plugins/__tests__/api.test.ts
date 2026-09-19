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
  useError().value = undefined;
});

test("shows a transport failure through the Nuxt error page", async () => {
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

  expect(result?.provide?.api).toBeTypeOf("function");
  expect(addNotification).not.toHaveBeenCalled();
  expect(useError().value).toMatchObject({
    statusCode: 500,
    statusMessage: "Network unavailable",
  });
});

type ErrorHook = (context: unknown) => void | Promise<void>;

test("runs shared and request-specific response error handlers in order", async () => {
  const events: string[] = [];
  let requestOptions: { onResponseError: ErrorHook[] } | undefined;
  const transport = vi.fn((_request: string, options: typeof requestOptions) => {
    requestOptions = options;
  });
  create.mockReturnValue(transport);
  vi.stubGlobal("$fetch", { create });
  const plugin = (await import("../api")).default;
  const result = await plugin({} as never);
  const requestHandler = vi.fn(() => {
    events.push("request");
  });
  addNotification.mockImplementation(() => {
    events.push("shared");
  });

  if (!result?.provide) throw new Error("API plugin did not provide a client");
  await result.provide.api("/api/projects", {
    onResponseError: [requestHandler],
  });
  if (!requestOptions) throw new Error("API request options were not captured");

  for (const hook of requestOptions.onResponseError) {
    await hook({
      options: {},
      response: { _data: { statusCode: 422, message: "Project request failed" } },
    });
  }

  expect(events).toEqual(["shared", "request"]);
  expect(addNotification).toHaveBeenCalledOnce();
  expect(requestHandler).toHaveBeenCalledOnce();
});

test("shows unexpected request errors and still runs request-specific handlers", async () => {
  const events: string[] = [];
  let requestOptions: { onRequestError: ErrorHook[] } | undefined;
  const transport = vi.fn((_request: string, options: typeof requestOptions) => {
    requestOptions = options;
  });
  create.mockReturnValue(transport);
  vi.stubGlobal("$fetch", { create });
  const plugin = (await import("../api")).default;
  const requestHandler = vi.fn(() => {
    events.push("request");
  });
  addNotification.mockImplementation(() => {
    events.push("shared");
  });

  const result = await plugin({} as never);
  if (!result?.provide) throw new Error("API plugin did not provide a client");
  await result.provide.api("/api/projects", {
    onRequestError: [requestHandler],
  });
  if (!requestOptions) throw new Error("API request options were not captured");

  for (const hook of requestOptions.onRequestError) {
    await hook({
      error: new Error("Network unavailable"),
      options: {},
    });
  }

  expect(events).toEqual(["request"]);
  expect(addNotification).not.toHaveBeenCalled();
  expect(useError().value).toMatchObject({ statusCode: 500 });
  expect(requestHandler).toHaveBeenCalledOnce();
});

test("runs shared and request-specific response error handlers for $api.raw in order", async () => {
  const events: string[] = [];
  let requestOptions: { onResponseError: ErrorHook[] } | undefined;
  const transport = Object.assign(vi.fn(), {
    raw: vi.fn((_request: string, options: typeof requestOptions) => {
      requestOptions = options;
    }),
  });
  create.mockReturnValue(transport);
  vi.stubGlobal("$fetch", { create });
  const plugin = (await import("../api")).default;
  const result = await plugin({} as never);
  const requestHandler = vi.fn(() => {
    events.push("request");
  });
  addNotification.mockImplementation(() => {
    events.push("shared");
  });

  if (!result?.provide) throw new Error("API plugin did not provide a client");
  await result.provide.api.raw("/api/projects", {
    onResponseError: [requestHandler],
  });
  if (!requestOptions) throw new Error("Raw API request options were not captured");

  for (const hook of requestOptions.onResponseError) {
    await hook({
      options: {},
      response: { _data: { statusCode: 422, message: "Project request failed" } },
    });
  }

  expect(events).toEqual(["shared", "request"]);
  expect(addNotification).toHaveBeenCalledOnce();
  expect(requestHandler).toHaveBeenCalledOnce();
});

test("does not mutate notification state when API hooks run on the server", async () => {
  vi.stubGlobal("$fetch", { create });
  const { createApiNotificationHooks } = await import("../api");
  const hooks = createApiNotificationHooks(addNotification, false);

  await hooks.onRequestError!({
    error: new Error("Network unavailable"),
    options: {},
  } as never);
  await hooks.onResponseError!({
    options: {},
    response: { _data: { message: "Project request failed" } },
  } as never);

  expect(addNotification).not.toHaveBeenCalled();
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
  expect(api).toHaveBeenCalledWith(
    "/api/comments",
    expect.objectContaining({ signal: controller.signal }),
  );
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
