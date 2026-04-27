<!--
  Table Component

  Usage:
  <Table :data="items" :columns="columns">
    <template #cell-{name|field}="{ entry }">
      Custom content here
    </template>
  </Table>

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
<script setup lang="ts" generic="T extends BaseEntity">
import { ArchiveX } from 'lucide-vue-next'
import { useSlots } from 'vue'

import {
  TableElement,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
} from './'
import type { TablePaginationProps } from './'

import type { BaseEntity } from '@/types/api'

export type TableColumn<Entry> = {
  /** Column header text */
  title: string
  /** Field key from entry object */
  field: keyof Entry
  /**
   * Custom slot name. If provided, use `#cell-{name}` for the slot.
   * Otherwise, slot name defaults to `#cell-{field}`.
   */
  name?: string
}

type TableProps<Entry> = {
  data: Entry[]
  columns: TableColumn<Entry>[]
  pagination?: TablePaginationProps
}

defineProps<TableProps<T>>()

const slots = useSlots()

const hasSlot = (name: string) => !!slots[name]
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
    <TableElement>
      <TableHeader>
        <TableRow>
          <TableHead v-for="(column, index) in columns" :key="column.title + index">
            {{ column.title }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(entry, entryIndex) in data" :key="entry?.id || entryIndex">
          <TableCell
            v-for="({ field, title, name }, columnIndex) in columns"
            :key="title + columnIndex"
          >
            <slot
              v-if="hasSlot(`cell-${name ?? String(field)}`)"
              :name="`cell-${name ?? String(field)}`"
              :entry="entry"
            />
            <template v-else>{{ entry[field] }}</template>
          </TableCell>
        </TableRow>
      </TableBody>
    </TableElement>
    <TablePagination v-if="pagination" v-bind="pagination" />
  </template>
</template>
