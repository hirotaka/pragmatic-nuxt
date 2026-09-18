<script setup lang="ts">
import { DialogClose } from "reka-ui";
import { watch } from "vue";
import { Button } from "@/components/ui/button";
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const props = withDefaults(defineProps<{
  isDone?: boolean;
  isPending?: boolean;
  title: string;
}>(), {
  isDone: false,
  isPending: false,
});

const { isOpen, open, close } = useDisclosure();

const handleOpenChange = (value: boolean) => {
  if (!value && props.isPending) return;
  if (value) {
    open();
  }
  else {
    close();
  }
};

watch(
  () => props.isDone,
  (isDone) => {
    if (isDone) {
      close();
    }
  },
);
</script>

<template>
  <DrawerRoot
    :open="isOpen"
    @update:open="handleOpenChange"
  >
    <DrawerTrigger
      as-child
      @click="open"
    >
      <slot name="triggerButton" />
    </DrawerTrigger>
    <DrawerContent class="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
      <div class="flex flex-col gap-6">
        <DrawerHeader>
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription class="sr-only">
            {{ title }} form
          </DrawerDescription>
        </DrawerHeader>
        <div>
          <slot />
        </div>
      </div>
      <DrawerFooter>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose as-child>
            <Button
              variant="outline"
              type="button"
              :disabled="isPending"
            >
              Close
            </Button>
          </DialogClose>
          <slot name="submitButton" />
        </div>
      </DrawerFooter>
    </DrawerContent>
  </DrawerRoot>
</template>
