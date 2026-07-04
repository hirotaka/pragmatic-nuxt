import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import AppConfirmationDialog from "../ConfirmationDialog.vue";
import AppFormDrawer from "../FormDrawer.vue";
import MarkdownPreview from "../MarkdownPreview.vue";
import NotificationCenter from "../NotificationCenter.vue";

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    notifications: [
      {
        id: "notification-1",
        type: "success",
        title: "Saved",
        message: "Profile updated.",
      },
    ],
    dismissNotification: vi.fn(),
  }),
}));

describe("app-specific UI components", () => {
  test("FormDrawer renders trigger, body, and submit content when open", async () => {
    const wrapper = await mountSuspended(AppFormDrawer, {
      props: {
        title: "Create Item",
        isDone: false,
      },
      slots: {
        triggerButton: "<button>Open drawer</button>",
        default: "Drawer body",
        submitButton: "Submit drawer",
      },
      global: {
        stubs: {
          DrawerRoot: { template: "<section><slot /></section>", props: ["open"] },
          DrawerTrigger: { template: "<div><slot /></div>", props: ["asChild"] },
          DrawerContent: { template: "<div><slot /></div>" },
          DrawerHeader: { template: "<header><slot /></header>" },
          DrawerTitle: { template: "<h2><slot /></h2>" },
          DrawerDescription: { template: "<p><slot /></p>" },
          DrawerFooter: { template: "<footer><slot /></footer>" },
          DialogClose: { template: "<span><slot /></span>", props: ["asChild"] },
        },
      },
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.text()).toContain("Create Item");
    expect(wrapper.text()).toContain("Open drawer");
    expect(wrapper.text()).toContain("Drawer body");
    expect(wrapper.text()).toContain("Submit drawer");
  });

  test("ConfirmationDialog emits confirm, cancel, and open updates", async () => {
    const wrapper = await mountSuspended(AppConfirmationDialog, {
      props: {
        open: true,
        title: "Delete item",
        body: "This cannot be undone.",
        variant: "danger",
      },
      slots: {
        triggerButton: "<button>Open dialog</button>",
      },
      global: {
        stubs: {
          DialogRoot: { template: "<section><slot /></section>", props: ["open"] },
          DialogTrigger: { template: "<div><slot /></div>", props: ["asChild"] },
          DialogContent: { template: "<div><slot /></div>" },
          DialogHeader: { template: "<header><slot /></header>" },
          DialogTitle: { template: "<h2><slot /></h2>" },
          DialogDescription: { template: "<p><slot /></p>" },
          DialogFooter: { template: "<footer><slot /></footer>" },
        },
      },
    });

    const buttons = wrapper.findAll("button");
    await buttons.find(button => button.text() === "Confirm")!.trigger("click");
    await buttons.find(button => button.text() === "Cancel")!.trigger("click");

    expect(wrapper.emitted("confirm")).toHaveLength(1);
    expect(wrapper.emitted("cancel")).toHaveLength(1);
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
  });

  test("MarkdownPreview renders markdown content", async () => {
    const wrapper = await mountSuspended(MarkdownPreview, {
      props: {
        value: "**Hello** markdown",
      },
    });

    expect(wrapper.text()).toContain("Hello markdown");
    expect(wrapper.html()).toContain("<strong>Hello</strong>");
  });

  test("NotificationCenter renders the app notification surface", async () => {
    const wrapper = await mountSuspended(NotificationCenter);

    expect(wrapper.text()).toContain("Saved");
    expect(wrapper.text()).toContain("Profile updated.");
  });
});
