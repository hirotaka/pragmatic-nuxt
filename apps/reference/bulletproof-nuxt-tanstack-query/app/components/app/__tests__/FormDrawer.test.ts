import { expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent } from "vue";
import AppFormDrawer from "../FormDrawer.vue";

const DrawerRootStub = defineComponent({
  name: "DrawerRootStub",
  props: ["open"],
  emits: ["update:open"],
  template: "<section><slot /></section>",
});

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

test("FormDrawer rejects close controls and open transitions while pending", async () => {
  const wrapper = await mountSuspended(AppFormDrawer, {
    props: {
      title: "Create Item",
      isPending: true,
    },
    slots: {
      triggerButton: "<button>Open drawer</button>",
      default: "Drawer body",
    },
    global: {
      stubs: {
        DrawerRoot: DrawerRootStub,
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
  const drawerRoot = wrapper.findComponent(DrawerRootStub);
  expect(drawerRoot.props("open")).toBe(true);
  expect(wrapper.get("button[type='button']").attributes("disabled")).toBeDefined();

  drawerRoot.vm.$emit("update:open", false);
  await wrapper.vm.$nextTick();
  expect(drawerRoot.props("open")).toBe(true);

  await wrapper.setProps({ isPending: false });
  drawerRoot.vm.$emit("update:open", false);
  await wrapper.vm.$nextTick();
  expect(drawerRoot.props("open")).toBe(false);
});
