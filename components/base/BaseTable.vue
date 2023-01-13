<script setup lang="ts">
import type { VNode } from "vue";
import { ArchiveBoxIcon } from "@heroicons/vue/24/outline";

type TableColumn<Entry> = {
  title: string;
  field: keyof Entry;
  Cell?({ entry }: { entry: Entry }): VNode;
};

type TableProps<Entry> = {
  data: Entry[];
  columns: TableColumn<Entry>[];
};

defineProps<TableProps>();
</script>

<template>
  <div
    v-if="!data.length"
    class="bg-white text-gray-500 h-80 flex justify-center items-center flex-col"
  >
    <ArchiveBoxIcon class="h-16 w-16" />
    <h4>No Entries Found</h4>
  </div>
  <div v-else class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div
          class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="(column, index) in columns"
                  :key="column.title + index"
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ column.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(entry, entryIndex) in data"
                :key="entry?.id || entryIndex"
                :class="entryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'"
              >
                <td
                  v-for="({ field, title, Cell }, columnIndex) in columns"
                  :key="title + columnIndex"
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  <template v-if="Cell">
                    <component :is="Cell" :entry="entry" />
                  </template>
                  <template v-else>
                    {{ entry[field] }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
