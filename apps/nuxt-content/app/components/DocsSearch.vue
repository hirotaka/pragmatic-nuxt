<script setup lang="ts">
import {
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxRoot,
} from "reka-ui";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { searchExcerpt } from "~/utils/docs-search-excerpt";

const props = withDefaults(defineProps<{
  collapsed?: boolean;
}>(), {
  collapsed: false,
});

const { open, query, items, initializing, busy, error } = useDocsSearch();
const statusId = useId();
const shortcut = import.meta.client && navigator.platform.includes("Mac") ? "⌘K" : "Ctrl K";
const statusMessage = computed(() => {
  if (error.value) return "Search is unavailable. Reload the page to try again.";
  if (initializing.value) return "Preparing documentation search…";
  if (!query.value.trim()) return "Type to search documentation.";
  if (!busy.value && !items.value.length) return "No results found.";
  return "";
});

async function selectItem(id: string) {
  open.value = false;
  await navigateTo(id);
}

function reloadPage() {
  window.location.reload();
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    open.value = true;
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  open.value = false;
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button
        type="button"
        variant="outline"
        :class="cn('w-full justify-start', props.collapsed && 'px-2')"
        aria-label="Search documentation"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Icon
          name="i-lucide-search"
          data-icon="inline-start"
          aria-hidden="true"
        />
        <span v-if="!props.collapsed">Search documentation</span>
        <kbd
          v-if="!props.collapsed"
          class="ml-auto rounded border px-1.5 py-0.5 text-[10px]"
        >{{ shortcut }}</kbd>
      </Button>
    </DialogTrigger>
    <DialogContent class="gap-3">
      <DialogHeader>
        <DialogTitle>Search documentation</DialogTitle>
        <DialogDescription>Search documentation pages and sections.</DialogDescription>
      </DialogHeader>
      <ComboboxRoot
        :open="true"
        ignore-filter
        :reset-search-term-on-blur="false"
        :reset-search-term-on-select="false"
      >
        <ComboboxInput
          v-model="query"
          aria-label="Search documentation"
          :aria-describedby="statusId"
          :aria-busy="busy"
          :auto-focus="true"
          :spellcheck="false"
          placeholder="Search documentation…"
          class="border-input focus-visible:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-base outline-none focus-visible:ring-2"
        />
        <p
          :id="statusId"
          role="status"
          class="py-2 text-sm text-muted-foreground"
        >
          {{ statusMessage }}
        </p>
        <p
          v-if="busy && !initializing"
          class="py-2 text-sm text-muted-foreground"
        >
          Searching…
        </p>
        <Button
          v-if="error"
          type="button"
          variant="outline"
          @click="reloadPage"
        >
          Reload page
        </Button>
        <ComboboxContent
          class="max-h-[min(60vh,24rem)] overflow-y-auto"
          @escape-key-down="open = false"
        >
          <ComboboxGroup v-if="items.length">
            <ComboboxLabel class="px-2 py-1 text-xs text-muted-foreground">
              Documentation
            </ComboboxLabel>
            <ComboboxItem
              v-for="item in items"
              :key="item.id"
              :value="item.id"
              class="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground flex cursor-pointer items-start gap-2 rounded-sm px-2 py-3 outline-none"
              @select="selectItem(item.id)"
            >
              <Icon
                name="i-lucide-file-text"
                class="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span class="flex min-w-0 flex-col gap-1">
                <span class="font-medium">{{ item.title }}</span>
                <span
                  v-if="item.titles.length"
                  class="text-xs text-muted-foreground"
                >{{ item.titles.join(" / ") }}</span>
                <span class="text-sm text-muted-foreground">{{ searchExcerpt(item.content, query) }}</span>
              </span>
            </ComboboxItem>
          </ComboboxGroup>
        </ComboboxContent>
      </ComboboxRoot>
    </DialogContent>
  </Dialog>
</template>
