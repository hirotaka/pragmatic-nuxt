import { expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent } from "vue";
import AppConfirmationDialog from "../ConfirmationDialog.vue";

const DialogRootStub = defineComponent({
  name: "DialogRootStub",
  props: ["open"],
  emits: ["update:open"],
  template: "<section><slot /></section>",
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

test("ConfirmationDialog rejects cancel and open=false transitions while loading", async () => {
  const wrapper = await mountSuspended(AppConfirmationDialog, {
    props: {
      open: true,
      title: "Delete item",
      isLoading: true,
    },
    global: {
      stubs: {
        DialogRoot: DialogRootStub,
        DialogContent: { template: "<div><slot /></div>" },
        DialogHeader: { template: "<header><slot /></header>" },
        DialogTitle: { template: "<h2><slot /></h2>" },
        DialogDescription: { template: "<p><slot /></p>" },
        DialogFooter: { template: "<footer><slot /></footer>" },
      },
    },
  });
  const cancel = wrapper.get("button");
  const dialogRoot = wrapper.findComponent(DialogRootStub);

  await cancel.trigger("click");
  dialogRoot.vm.$emit("update:open", false);
  await wrapper.vm.$nextTick();

  expect(wrapper.emitted("cancel")).toBeUndefined();
  expect(wrapper.emitted("update:open")).toBeUndefined();

  await wrapper.setProps({ isLoading: false });
  dialogRoot.vm.$emit("update:open", false);
  await wrapper.vm.$nextTick();
  expect(wrapper.emitted("cancel")).toHaveLength(1);
  expect(wrapper.emitted("update:open")).toEqual([[false]]);
});
