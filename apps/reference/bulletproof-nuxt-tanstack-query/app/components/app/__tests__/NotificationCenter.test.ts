import { afterEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import NotificationCenter from "../NotificationCenter.vue";

afterEach(() => {
  vi.useRealTimers();
});

test("auto-dismisses preloaded and client-added notifications", async () => {
  vi.useFakeTimers();

  const Harness = defineComponent({
    setup() {
      const { addNotification, notifications } = useNotifications();
      notifications.value = [{
        id: "hydrated-notification",
        type: "error",
        title: "Error",
        message: "Server read failed",
      }];

      return () => h("section", [
        h(NotificationCenter),
        h("button", {
          "data-testid": "add-notification",
          "onClick": () => addNotification({
            type: "error",
            title: "Error",
            message: "Client read failed",
          }),
        }, "Add notification"),
      ]);
    },
  });

  const wrapper = await mountSuspended(Harness);
  expect(wrapper.text()).toContain("Server read failed");

  await vi.advanceTimersByTimeAsync(5000);
  await nextTick();

  expect(wrapper.text()).not.toContain("Server read failed");

  await wrapper.get("[data-testid='add-notification']").trigger("click");
  expect(wrapper.text()).toContain("Client read failed");

  await vi.advanceTimersByTimeAsync(5000);
  await nextTick();

  expect(wrapper.text()).not.toContain("Client read failed");
});
