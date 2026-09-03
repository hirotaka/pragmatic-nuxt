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
vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

beforeEach(() => {
  addNotification.mockReset();
});

type ErrorHook = (context: unknown) => void | Promise<void>;

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
      _data: { message: "Project request failed" },
    },
  };

  for (const hook of options.onResponseError) {
    await hook(context);
  }

  expect(events).toEqual(["shared", "project"]);
  expect(addNotification).toHaveBeenCalledOnce();
  expect(handleProjectError).toHaveBeenCalledOnce();
});

test("runs shared and API-call request error handlers in order", async () => {
  const events: string[] = [];
  const handleProjectError = vi.fn(() => {
    events.push("project");
  });
  addNotification.mockImplementation(() => {
    events.push("shared");
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

  expect(events).toEqual(["shared", "project"]);
  expect(addNotification).toHaveBeenCalledOnce();
  expect(handleProjectError).toHaveBeenCalledOnce();
});
