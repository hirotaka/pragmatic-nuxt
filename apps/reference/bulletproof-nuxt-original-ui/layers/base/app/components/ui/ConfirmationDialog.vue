<script setup lang="ts">
import { computed } from "vue";
import { CircleAlert, Info } from "lucide-vue-next";
import DialogRoot from "~~/components/ui/dialog/DialogRoot.vue";
import DialogTrigger from "~~/components/ui/dialog/DialogTrigger.vue";
import DialogContent from "~~/components/ui/dialog/DialogContent.vue";
import DialogHeader from "~~/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "~~/components/ui/dialog/DialogTitle.vue";
import DialogDescription from "~~/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "~~/components/ui/dialog/DialogFooter.vue";
import Button from "./Button.vue";

type VariantType = "danger" | "info";

interface Props {
  open?: boolean;
  title: string;
  body?: string;
  variant?: VariantType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  variant: "danger",
  confirmText: "Confirm",
  cancelText: "Cancel",
  isLoading: false,
  body: undefined,
});

const emit = defineEmits<{
  "update:open": [value: boolean];
  "confirm": [];
  "cancel": [];
}>();

const icon = computed(() => {
  return props.variant === "danger" ? CircleAlert : Info;
});

const confirmButtonVariant = computed(() => {
  return props.variant === "danger" ? "destructive" : "default";
});

const handleConfirm = () => {
  emit("confirm");
};

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
          @click="handleConfirm"
        >
          {{ confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
