<script setup lang="ts" generic="T extends { id: string }">
import { ArchiveX } from "lucide-vue-next";
import { useSlots } from "vue";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TableColumn } from "./data-table";

type DataTableProps<Entry> = {
  data: readonly Entry[];
  columns: TableColumn<Entry>[];
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
          class="break-words"
        >
          {{ description }}
        </CardDescription>
      </div>
      <div class="flex min-w-0 items-center gap-3">
        <p
          v-if="summary"
          class="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          {{ summary }}
        </p>
        <slot name="actions" />
      </div>
    </CardHeader>
    <CardContent class="p-0">
      <div
        v-if="!data?.length"
        class="flex min-h-80 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground"
      >
        <div class="flex size-16 items-center justify-center rounded-full bg-muted">
          <ArchiveX class="size-8" />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-foreground">
            {{ emptyTitle }}
          </h3>
          <p class="text-sm">
            {{ emptyDescription }}
          </p>
        </div>
      </div>
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
            :current-page="pagination.currentPage"
            :total-pages="pagination.totalPages"
            @update:current-page="handlePageChange"
          />
        </div>
      </template>
    </CardContent>
  </Card>
</template>
