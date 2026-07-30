import type { LoginInput } from "~auth/shared/schemas";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, expect, test, vi } from "vitest";
import { useLogin } from "../useLogin";

const { addNotification, api, refreshSession } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  api: vi.fn(),
  refreshSession: vi.fn(),
}));

mockNuxtImport<typeof useNuxtApp>("useNuxtApp", original => (...args) => new Proxy(original(...args), {
  get: (target, property, receiver) => property === "$api"
    ? api
    : Reflect.get(target, property, receiver),
}));
mockNuxtImport("useUserSession", () => () => ({ fetch: refreshSession }));
vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

beforeEach(() => {
  addNotification.mockReset();
  api.mockReset();
  refreshSession.mockReset().mockResolvedValue(undefined);
});

const loginInput = (): LoginInput => ({
  email: "ada@example.com",
  password: "Password123!",
});

test("refreshes the user session before reporting success", async () => {
  const events: string[] = [];
  let resolveSession!: () => void;
  const sessionSettlement = new Promise<void>((resolve) => {
    resolveSession = resolve;
  });
  api.mockImplementation(async () => {
    events.push("request");
  });
  refreshSession.mockImplementation(() => {
    events.push("refresh");
    return sessionSettlement;
  });
  addNotification.mockImplementation(() => events.push("notification"));

  let settled = false;
  const login = useLogin()(loginInput()).then(() => {
    settled = true;
  });

  await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());
  expect(events).toEqual(["request", "refresh"]);
  expect(settled).toBe(false);
  expect(addNotification).not.toHaveBeenCalled();

  resolveSession();
  await login;

  expect(settled).toBe(true);
  expect(events).toEqual(["request", "refresh", "notification"]);
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Logged In" });
});
