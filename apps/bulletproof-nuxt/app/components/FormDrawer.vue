<script setup lang="ts">
defineProps<{
  title: string;
}>();

const { isOpen, open, close } = useDisclosure();

const handleOpenChange = (value: boolean) => {
  if (value) open();
  else close();
};
</script>

<template>
  <Sheet
    :open="isOpen"
    @update:open="handleOpenChange"
  >
    <SheetTrigger as-child>
      <slot name="triggerButton" />
    </SheetTrigger>
    <SheetContent class="flex max-w-200 flex-col justify-between sm:max-w-135">
      <div class="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle>{{ title }}</SheetTitle>
          <SheetDescription class="sr-only">
            {{ title }} form
          </SheetDescription>
        </SheetHeader>
        <div>
          <slot :close="close" />
        </div>
      </div>
      <SheetFooter>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SheetClose as-child>
            <Button
              variant="outline"
              type="button"
            >
              Close
            </Button>
          </SheetClose>
          <slot name="submitButton" />
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
