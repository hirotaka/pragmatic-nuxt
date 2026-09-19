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

const stubs = {
  DrawerRoot: DrawerRootStub,
  DrawerTrigger: { template: "<div><slot /></div>", props: ["asChild"] },
  DrawerContent: { template: "<div><slot /></div>" },
  DrawerHeader: { template: "<header><slot /></header>" },
  DrawerTitle: { template: "<h2><slot /></h2>" },
  DrawerDescription: { template: "<p><slot /></p>" },
  DrawerFooter: { template: "<footer><slot /></footer>" },
  DialogClose: { template: "<span><slot /></span>", props: ["asChild"] },
};

test("FormDrawer renders presentation slots when open", async () => {
  const wrapper = await mountSuspended(AppFormDrawer, {
    props: { title: "Create Item" },
    slots: {
      triggerButton: "<button>Open drawer</button>",
      default: "Drawer body",
      submitButton: "Submit drawer",
    },
    global: { stubs },
  });

  await wrapper.get("button").trigger("click");

  expect(wrapper.text()).toContain("Create Item");
  expect(wrapper.text()).toContain("Open drawer");
  expect(wrapper.text()).toContain("Drawer body");
  expect(wrapper.text()).toContain("Submit drawer");
  expect(wrapper.findComponent(DrawerRootStub).props("open")).toBe(true);
});
