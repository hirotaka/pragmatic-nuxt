<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <Sheet v-slot="{ close }">
    <SheetTrigger as-child>
      <slot name="triggerButton" />
    </SheetTrigger>
    <SheetContent class="max-w-200 sm:max-w-135">
      <SheetHeader>
        <SheetTitle>{{ title }}</SheetTitle>
        <SheetDescription class="sr-only">
          {{ title }} form
        </SheetDescription>
      </SheetHeader>
      <div
        data-slot="form-drawer-body"
        class="grid flex-1 auto-rows-min gap-6 px-4"
      >
        <slot :close="close" />
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
