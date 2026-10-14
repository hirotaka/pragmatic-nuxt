import { beforeEach, expect, test, vi } from "vitest";
import { useAPI } from "../useAPI";

const { addNotification, createUseFetchMock } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createUseFetchMock: Object.assign(vi.fn(), {
    __nuxt_factory: vi.fn((defaults: (options: Record<string, unknown>) => unknown) => (
      _request: string,
      options: Record<string, unknown> = {},
    ) => defaults(options)),
  }),
}));

vi.mock("#app/composables/fetch", async importOriginal => ({
  ...await importOriginal<typeof import("#app/composables/fetch")>(),
  createUseFetch: createUseFetchMock,
}));
vi.mock("vue-sonner", () => ({
  toast: { error: addNotification },
}));

beforeEach(() => {
  addNotification.mockReset();
  useError().value = undefined;
});

type ErrorHook = (context: unknown) => void | Promise<void>;

async function runHooks(hooks: ErrorHook[], context: unknown) {
  for (const hook of hooks) await hook(context);
}

test("runs shared and API-call response error handlers in order", async () => {
  const events: string[] = [];
  const handleProjectError = vi.fn(() => {
    events.push("project");
  });
  addNotification.mockImplementation(() => {
    events.push("shared");
  });

  const options = useAPI("/api/projects", {
    onResponseError: handleProjectError,
  }) as unknown as { onResponseError: ErrorHook[] };
  const context = {
    options: {},
    response: {
      _data: { statusCode: 422, message: "Project request failed" },
    },
  };

  for (const hook of options.onResponseError) {
    await hook(context);
  }

  expect(events).toEqual(["shared", "project"]);
  expect(addNotification).toHaveBeenCalledWith("Error", { description: "Project request failed" });
  expect(handleProjectError).toHaveBeenCalledOnce();
  expect(useError().value).toBeUndefined();
});

test("keeps client notification overrides and suppression for predictable failures", async () => {
  const options = useAPI("/api/projects") as unknown as { onResponseError: ErrorHook[] };
  const response = { status: 404, _data: { statusCode: 404, message: "Project not found" } };

  await runHooks(options.onResponseError, {
    options: { errorNotification: { title: "Unavailable", message: "Choose another project" } },
    response,
  });
  expect(addNotification).toHaveBeenCalledWith("Unavailable", { description: "Choose another project" });

  addNotification.mockClear();
  await runHooks(options.onResponseError, { options: { errorNotification: false }, response });
  expect(addNotification).not.toHaveBeenCalled();
  expect(useError().value).toBeUndefined();
});

test("shows unexpected response errors even when client notifications are suppressed", async () => {
  const handleResponseError = vi.fn();
  const options = useAPI("/api/projects", {
    onResponseError: handleResponseError,
  }) as unknown as { onResponseError: ErrorHook[] };

  await runHooks(options.onResponseError, {
    options: { errorNotification: false },
    response: { status: 503, _data: { statusCode: 503, message: "Service unavailable" } },
  });

  expect(useError().value).toMatchObject({ statusCode: 503, statusMessage: "Service unavailable" });
  expect(addNotification).not.toHaveBeenCalled();
  expect(handleResponseError).toHaveBeenCalledOnce();
});

test("does not show an error page or toast for cancelled requests", async () => {
  const options = useAPI("/api/projects") as unknown as { onRequestError: ErrorHook[] };
  const abort = new DOMException("Cancelled", "AbortError");

  for (const error of [abort, { name: "FetchError", cause: abort }]) {
    await runHooks(options.onRequestError, { options: {}, error });
  }

  expect(useError().value).toBeUndefined();
  expect(addNotification).not.toHaveBeenCalled();
});

test("shows unexpected request errors and still runs the API-call handler", async () => {
  const events: string[] = [];
  const handleProjectError = vi.fn(() => {
    events.push("project");
  });

  const options = useAPI("/api/projects", {
    onRequestError: handleProjectError,
  }) as unknown as { onRequestError: ErrorHook[] };
  const context = {
    error: new Error("Network unavailable"),
    options: {},
  };

  for (const hook of options.onRequestError) {
    await hook(context);
  }

  expect(events).toEqual(["project"]);
  expect(addNotification).not.toHaveBeenCalled();
  expect(useError().value).toMatchObject({
    statusCode: 500,
    statusMessage: "Network unavailable",
  });
  expect(handleProjectError).toHaveBeenCalledOnce();
});
