import { expect, test, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useNotifications } from "../useNotifications";

// Mock useState to return a reactive ref
vi.mock("#app", async importOriginal => ({
  ...await importOriginal<typeof import("#app")>(),
  useState: (_key: string, init: () => unknown) => ref(init()),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("should add and remove notifications", () => {
  const { addNotification, dismissNotification, notifications }
    = useNotifications();

  expect(notifications.value.length).toBe(0);

  // Add notification
  const id = addNotification({
    title: "Hello World",
    type: "info",
    message: "This is a notification",
  });

  expect(notifications.value.length).toBe(1);
  expect(notifications.value[0]).toMatchObject({
    title: "Hello World",
    type: "info",
    message: "This is a notification",
  });

  // Dismiss notification
  dismissNotification(id);

  expect(notifications.value.length).toBe(0);
});
