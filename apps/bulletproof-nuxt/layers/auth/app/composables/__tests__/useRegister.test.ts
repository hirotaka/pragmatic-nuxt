import type { RegisterInput } from "~auth/shared/schemas";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, expect, test, vi } from "vitest";
import { useRegister } from "../useRegister";

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

const registerInput = (): RegisterInput => ({
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  password: "Password123!",
  teamId: null,
  teamName: "Analytical Engines",
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
  const register = useRegister()(registerInput()).then(() => {
    settled = true;
  });

  await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());
  expect(events).toEqual(["request", "refresh"]);
  expect(settled).toBe(false);
  expect(addNotification).not.toHaveBeenCalled();

  resolveSession();
  await register;

  expect(settled).toBe(true);
  expect(events).toEqual(["request", "refresh", "notification"]);
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Account Created",
  });
});
