<script setup lang="ts">
import type { VNode } from "vue";
import { FileCode2 } from "lucide-vue-next";
import { Comment, Fragment, Text, useSlots } from "vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface FilePane {
  id: string;
  filename: string;
  language: string;
  node: VNode;
}

const props = defineProps<{ defaultValue?: string }>();
const slots = useSlots();

function flatten(nodes: VNode[] = []): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      return flatten(node.children as VNode[]);
    }

    if (node.type === Comment || node.type === Text) {
      return [];
    }

    return [node];
  });
}

const files = computed<FilePane[]>(() => flatten(slots.default?.()).map((node, index) => {
  const nodeProps = (node.props || {}) as Record<string, unknown>;
  const filename = String(nodeProps.filename || `file-${index + 1}`);
  const language = String(nodeProps.language || "text");

  return {
    id: filename,
    filename,
    language,
    node,
  };
}));

const defaultValue = computed(() => {
  if (props.defaultValue && files.value.some(file => file.id === props.defaultValue)) {
    return props.defaultValue;
  }

  return files.value[0]?.id || "file-0";
});

function basename(filename: string) {
  return filename.split("/").pop() || filename;
}

function dirname(filename: string) {
  const parts = filename.split("/");
  parts.pop();
  return parts.join("/");
}
</script>

<template>
  <Tabs
    :default-value="defaultValue"
    class="code-surface border-grid my-6 grid overflow-hidden rounded-lg border bg-muted/20 text-card-foreground md:grid-cols-[220px_minmax(0,1fr)]"
  >
    <TabsList class="border-grid h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-background/80 p-1.5 md:flex-col md:items-stretch md:overflow-visible md:border-b-0 md:border-r md:bg-muted/20">
      <TabsTrigger
        v-for="file in files"
        :key="file.id"
        :value="file.id"
        class="h-auto min-w-40 flex-none justify-start gap-2 rounded-md px-2.5 py-2 text-left font-mono text-xs text-muted-foreground shadow-none data-[state=active]:border-border/70 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none md:min-w-0 dark:data-[state=active]:bg-background"
      >
        <FileCode2 class="size-4 shrink-0" />
        <span class="min-w-0 truncate">
          <span
            v-if="dirname(file.filename)"
            class="text-muted-foreground/70"
          >{{ dirname(file.filename) }}/</span>{{ basename(file.filename) }}
        </span>
      </TabsTrigger>
    </TabsList>
    <div class="min-w-0">
      <TabsContent
        v-for="file in files"
        :key="file.id"
        :value="file.id"
        class="m-0 [&_.code-surface]:my-0 [&_.code-surface]:rounded-none [&_.code-surface]:border-0 [&_.code-surface>div:first-child]:bg-transparent [&_>_:first-child]:mt-0 [&_>_:last-child]:mb-0"
      >
        <component :is="file.node" />
      </TabsContent>
    </div>
  </Tabs>
</template>
