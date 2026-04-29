<!--
  Table Component

  Usage:
  <UTable :data="items" :columns="columns">
    <template #cell-{name|field}="{ entry }">
      Custom content here
    </template>
  </UTable>

  Slot naming:
  - Slot name is `#cell-{name}` if column has `name` property
  - Otherwise `#cell-{field}` using the field property
  - If no slot provided, displays `entry[field]` as text

  Example:
  const columns = [
    { title: 'Title', field: 'title' },                    // #cell-title or auto-display
    { title: 'Created At', field: 'createdAt' },           // #cell-createdAt
    { title: '', field: 'id', name: 'view' },              // #cell-view
    { title: '', field: 'id', name: 'delete' },            // #cell-delete
  ]
-->
<script setup lang="ts" generic="T extends { id: string }">
import { ArchiveX } from "lucide-vue-next";
import { useSlots } from "vue";
import type { TableColumn } from "./types";

type TableProps<Entry> = {
  data: readonly Entry[];
  columns: TableColumn<Entry>[];
  pagination?: {
    totalPages: number;
    currentPage: number;
  };
};

defineProps<TableProps<T>>();
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
  <div
    v-if="!data?.length"
    class="flex h-80 flex-col items-center justify-center bg-white text-gray-500"
  >
    <ArchiveX class="size-16" />
    <h4>No Entries Found</h4>
  </div>
  <template v-else>
    <UTableElement>
      <UTableHeader>
        <UTableRow>
          <UTableHead
            v-for="(column, index) in columns"
            :key="column.title + index"
          >
            {{ column.title }}
          </UTableHead>
        </UTableRow>
      </UTableHeader>
      <UTableBody>
        <UTableRow
          v-for="(entry, entryIndex) in data"
          :key="entry?.id || entryIndex"
        >
          <UTableCell
            v-for="({ field, title, name }, columnIndex) in columns"
            :key="title + columnIndex"
          >
            <slot
              v-if="hasSlot(`cell-${name ?? String(field)}`)"
              :name="`cell-${name ?? String(field)}`"
              :entry="entry"
            />
            <template v-else>
              {{ entry[field] }}
            </template>
          </UTableCell>
        </UTableRow>
      </UTableBody>
    </UTableElement>
    <div
      v-if="pagination"
      class="flex justify-end py-8"
    >
      <UPagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        @update:current-page="handlePageChange"
      />
    </div>
  </template>
</template>
