import { expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, inject, provide, type InjectionKey } from "vue";
import FormDrawer from "../FormDrawer.vue";

const updateSheetOpenKey: InjectionKey<(open: boolean) => void> = Symbol("update-sheet-open");

const SheetRootStub = defineComponent({
  name: "SheetRootStub",
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:open"],
  setup(props, { emit, slots }) {
    provide(updateSheetOpenKey, open => emit("update:open", open));

    return () => h("section", {
      "data-testid": "sheet-root",
      "data-open": String(props.open),
    }, slots.default?.());
  },
});

const SheetTriggerStub = defineComponent({
  name: "SheetTriggerStub",
  props: { asChild: Boolean },
  setup(_, { slots }) {
    const updateOpen = inject(updateSheetOpenKey);

    return () => h("div", {
      onClick: () => updateOpen?.(true),
    }, slots.default?.());
  },
});

const SheetCloseStub = defineComponent({
  name: "SheetCloseStub",
  props: { asChild: Boolean },
  setup(_, { slots }) {
    const updateOpen = inject(updateSheetOpenKey);

    return () => h("div", {
      onClick: () => updateOpen?.(false),
    }, slots.default?.());
  },
});

const stubs = {
  Sheet: SheetRootStub,
  SheetTrigger: SheetTriggerStub,
  SheetContent: { template: "<div><slot /></div>" },
  SheetHeader: { template: "<header><slot /></header>" },
  SheetTitle: { template: "<h2><slot /></h2>" },
  SheetDescription: { template: "<p><slot /></p>" },
  SheetFooter: { template: "<footer><slot /></footer>" },
  SheetClose: SheetCloseStub,
};

test("FormDrawer opens and closes while rendering presentation slots", async () => {
  const wrapper = await mountSuspended(FormDrawer, {
    props: { title: "Create Item" },
    slots: {
      triggerButton: "<button>Open drawer</button>",
      default: "Drawer body",
      submitButton: "Submit drawer",
    },
    global: { stubs },
  });

  const sheetRoot = wrapper.findComponent(SheetRootStub);
  await wrapper.get("button").trigger("click");

  expect(sheetRoot.props("open")).toBe(true);
  expect(wrapper.text()).toContain("Create Item");
  expect(wrapper.text()).toContain("Open drawer");
  expect(wrapper.text()).toContain("Drawer body");
  expect(wrapper.text()).toContain("Submit drawer");

  const closeButton = wrapper.findAll("button").find(button => button.text() === "Close");
  await closeButton!.trigger("click");

  expect(sheetRoot.props("open")).toBe(false);
});
