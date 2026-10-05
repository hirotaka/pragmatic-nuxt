<script setup lang="ts" generic="T extends { id: string }">
import { ArchiveX } from "@lucide/vue";
import { useSlots } from "vue";

export type TableColumn<Entry> = {
  title: string;
  field: keyof Entry;
  name?: string;
};

export type DataTableProps<Entry extends { id: string }> = {
  data: readonly Entry[];
  columns: readonly TableColumn<Entry>[];
  emptyTitle?: string;
  emptyDescription?: string;
  title?: string;
  description?: string;
  summary?: string;
  pagination?: {
    totalPages: number;
    currentPage: number;
  };
};

withDefaults(defineProps<DataTableProps<T>>(), {
  emptyTitle: "No entries found",
  emptyDescription: "Create a new entry to get started.",
  title: undefined,
  description: undefined,
  summary: undefined,
  pagination: undefined,
});

const emit = defineEmits<{
  "page-change": [page: number];
}>();

const slots = useSlots();

const hasSlot = (name: string) => !!slots[name];

const handlePageChange = (page: number) => {
  emit("page-change", page);
};
</script>

<template>
  <Card class="min-w-0">
    <CardHeader
      v-if="title || description || summary || hasSlot('actions')"
      class="flex min-w-0 flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="grid min-w-0 gap-1">
        <CardTitle v-if="title">
          {{ title }}
        </CardTitle>
        <CardDescription
          v-if="description"
          class="wrap-break-word"
        >
          {{ description }}
        </CardDescription>
      </div>
      <div class="flex min-w-0 items-center gap-3">
        <Badge
          v-if="summary"
          variant="secondary"
          class="shrink-0"
        >
          {{ summary }}
        </Badge>
        <slot name="actions" />
      </div>
    </CardHeader>
    <CardContent class="p-0">
      <Empty
        v-if="!data?.length"
        class="min-h-80 gap-3 p-8"
      >
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            class="size-16 rounded-full"
          >
            <ArchiveX />
          </EmptyMedia>
          <EmptyTitle>
            <h3 class="text-base font-semibold">
              {{ emptyTitle }}
            </h3>
          </EmptyTitle>
          <EmptyDescription>{{ emptyDescription }}</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <template v-else>
        <div class="overflow-hidden rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  v-for="(column, index) in columns"
                  :key="column.title + index"
                  :class="column.name === 'delete' || column.name === 'view' ? 'w-20 text-right' : undefined"
                >
                  {{ column.title }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(entry, entryIndex) in data"
                :key="entry?.id || entryIndex"
              >
                <TableCell
                  v-for="({ field, title: columnTitle, name }, columnIndex) in columns"
                  :key="columnTitle + columnIndex"
                  :class="name === 'delete' || name === 'view' ? 'text-right' : undefined"
                >
                  <slot
                    v-if="hasSlot(`cell-${name ?? String(field)}`)"
                    :name="`cell-${name ?? String(field)}`"
                    :entry="entry"
                  />
                  <template v-else>
                    {{ entry[field] }}
                  </template>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div
          v-if="pagination"
          class="flex items-center justify-between border-t px-4 py-3"
        >
          <p class="text-sm text-muted-foreground">
            Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
          </p>
          <Pagination
            :page="pagination.currentPage"
            :total="pagination.totalPages"
            :items-per-page="1"
            @update:page="handlePageChange"
          >
            <PaginationContent v-slot="{ items }">
              <PaginationPrevious />
              <template
                v-for="(item, index) in items"
                :key="index"
              >
                <PaginationItem
                  v-if="item.type === 'page'"
                  :value="item.value"
                  :is-active="item.value === pagination.currentPage"
                >
                  {{ item.value }}
                </PaginationItem>
                <PaginationEllipsis v-else />
              </template>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
