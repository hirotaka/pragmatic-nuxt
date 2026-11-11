<script setup lang="ts">
import type { VNode } from "vue";
import { Comment, Fragment, Text, useSlots } from "vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface Pane {
  id: string;
  label: string;
  node: VNode;
}

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

function labelFor(node: VNode, index: number) {
  const props = (node.props || {}) as Record<string, unknown>;
  const filename = props.filename || props[":filename"];
  const language = props.language || props[":language"];

  return String(filename || language || `Code ${index + 1}`);
}

const panes = computed<Pane[]>(() => flatten(slots.default?.()).map((node, index) => ({
  id: `code-${index}`,
  label: labelFor(node, index),
  node,
})));

const defaultValue = computed(() => panes.value[0]?.id || "code-0");
</script>

<template>
  <Tabs
    :default-value="defaultValue"
    class="code-surface border-grid my-6 overflow-hidden rounded-lg border bg-muted/20 text-card-foreground"
  >
    <TabsList class="border-grid h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-background/80 p-1.5">
      <TabsTrigger
        v-for="pane in panes"
        :key="pane.id"
        :value="pane.id"
        class="h-7 flex-none rounded-md px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground shadow-none data-[state=active]:border-border/70 data-[state=active]:bg-muted/50 data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-muted/50"
      >
        {{ pane.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="pane in panes"
      :key="pane.id"
      :value="pane.id"
      class="m-0 [&_.code-surface]:my-0 [&_.code-surface]:rounded-none [&_.code-surface]:border-0 [&_.code-surface>div:first-child]:bg-transparent [&_>_:first-child]:mt-0 [&_>_:last-child]:mb-0"
    >
      <component :is="pane.node" />
    </TabsContent>
  </Tabs>
</template>
