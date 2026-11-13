<script setup lang="ts">
import { Check, Clipboard } from "lucide-vue-next";

const props = withDefaults(defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: number[];
  meta?: string | null;
  class?: string | null;
}>(), {
  code: "",
  language: null,
  filename: null,
  highlights: () => [],
  meta: null,
  class: null,
});

const copied = ref(false);
const label = computed(() => props.filename || props.language || "Code");
const showHeader = computed(() => Boolean(props.filename || props.language || props.code));

async function copyCode() {
  if (!props.code) return;

  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <div class="code-surface border-grid my-6 overflow-hidden rounded-lg border bg-muted/20 text-card-foreground">
    <div
      v-if="showHeader"
      class="border-grid flex min-h-9 items-center justify-between gap-3 border-b bg-background/80 px-3 py-1.5"
    >
      <div class="flex min-w-0 items-baseline gap-2 font-mono text-xs">
        <span class="truncate font-medium text-foreground">{{ label }}</span>
        <span
          v-if="language && filename"
          class="text-muted-foreground"
        >{{ language }}</span>
      </div>
      <button
        v-if="code"
        type="button"
        class="text-muted-foreground hover:text-foreground relative inline-flex size-8 items-center justify-center rounded-md hover:bg-muted sm:size-7"
        :aria-label="copied ? 'Copied code' : 'Copy code'"
        @click="copyCode"
      >
        <span
          class="pointer-fine:hidden absolute left-1/2 top-1/2 size-[max(100%,3rem)] -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        />
        <Check
          v-if="copied"
          class="size-3.5"
        />
        <Clipboard
          v-else
          class="size-3.5"
        />
      </button>
    </div>
    <pre :class="['m-0 overflow-x-auto bg-transparent p-3.5 text-sm leading-6 sm:p-4', props.class]"><slot /></pre>
  </div>
</template>
