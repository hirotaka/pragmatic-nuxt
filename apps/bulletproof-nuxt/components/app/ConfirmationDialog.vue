<script setup lang="ts">
import { CircleAlert, Info } from "lucide-vue-next";
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const props = withDefaults(defineProps<{
  open?: boolean;
  title: string;
  body?: string;
  variant?: "danger" | "info";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}>(), {
  open: false,
  body: undefined,
  variant: "danger",
  confirmText: "Confirm",
  cancelText: "Cancel",
  isLoading: false,
});

const emit = defineEmits<{
  "update:open": [value: boolean];
  "cancel": [];
  "confirm": [];
}>();

const icon = computed(() => props.variant === "danger" ? CircleAlert : Info);

const confirmButtonVariant = computed(() => props.variant === "danger" ? "destructive" : "default");

const handleCancel = () => {
  emit("cancel");
  emit("update:open", false);
};

const handleOpenChange = (value: boolean) => {
  emit("update:open", value);
  if (!value) {
    emit("cancel");
  }
};
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogTrigger
      v-if="$slots.triggerButton"
      as-child
      :aria-hidden="open ? 'true' : undefined"
    >
      <slot name="triggerButton" />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <div class="flex items-center gap-2">
          <component
            :is="icon"
            class="h-5 w-5"
            :class="{
              'text-destructive': variant === 'danger',
              'text-primary': variant === 'info',
            }"
          />
          <DialogTitle>{{ title }}</DialogTitle>
        </div>
        <DialogDescription v-if="body">
          {{ body }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="mt-4">
        <Button
          variant="outline"
          :disabled="isLoading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </Button>
        <Button
          :variant="confirmButtonVariant"
          :is-loading="isLoading"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
