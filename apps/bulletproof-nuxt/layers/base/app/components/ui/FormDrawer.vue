<script setup lang="ts">
import { watch } from "vue";
import { DialogClose } from "reka-ui";
import { useDisclosure } from "#layers/base/app/composables/useDisclosure";
import DrawerRoot from "./drawer/DrawerRoot.vue";
import DrawerTrigger from "./drawer/DrawerTrigger.vue";
import DrawerContent from "./drawer/DrawerContent.vue";
import DrawerHeader from "./drawer/DrawerHeader.vue";
import DrawerTitle from "./drawer/DrawerTitle.vue";
import DrawerDescription from "./drawer/DrawerDescription.vue";
import DrawerFooter from "./drawer/DrawerFooter.vue";
import Button from "./Button.vue";

interface Props {
  isDone?: boolean;
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  isDone: false,
});

const { isOpen, open, close } = useDisclosure();

// Close drawer when form submission is done
watch(
  () => props.isDone,
  (newValue) => {
    if (newValue) {
      close();
    }
  },
);
</script>

<template>
  <DrawerRoot
    :open="isOpen"
    @update:open="(value) => value ? open() : close()"
  >
    <DrawerTrigger as-child>
      <slot name="triggerButton" />
    </DrawerTrigger>
    <DrawerContent class="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
      <div class="flex flex-col gap-6">
        <DrawerHeader>
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription class="sr-only">
            {{ title }}
          </DrawerDescription>
        </DrawerHeader>
        <div>
          <slot />
        </div>
      </div>
      <DrawerFooter>
        <DialogClose as-child>
          <Button
            variant="outline"
            type="button"
          >
            Close
          </Button>
        </DialogClose>
        <slot name="submitButton" />
      </DrawerFooter>
    </DrawerContent>
  </DrawerRoot>
</template>
