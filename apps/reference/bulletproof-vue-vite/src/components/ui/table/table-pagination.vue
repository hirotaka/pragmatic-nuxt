<script lang="ts">
export type TablePaginationProps = {
  totalPages: number
  currentPage: number
  rootUrl: string
}
</script>

<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationItem,
  PaginationEllipsis,
} from './'

const props = defineProps<TablePaginationProps>()

const createHref = (page: number) => `${props.rootUrl}?page=${page}`
</script>

<template>
  <Pagination class="justify-end py-8">
    <PaginationContent>
      <PaginationItem v-if="currentPage > 1">
        <PaginationPrevious :href="createHref(currentPage - 1)" />
      </PaginationItem>
      <PaginationItem v-if="currentPage > 2">
        <PaginationEllipsis />
      </PaginationItem>
      <PaginationItem v-if="currentPage > 1">
        <PaginationLink :href="createHref(currentPage - 1)">
          {{ currentPage - 1 }}
        </PaginationLink>
      </PaginationItem>
      <PaginationItem class="rounded-sm bg-gray-200">
        <PaginationLink :href="createHref(currentPage)">
          {{ currentPage }}
        </PaginationLink>
      </PaginationItem>
      <PaginationItem v-if="totalPages > currentPage">
        <PaginationLink :href="createHref(currentPage + 1)">
          {{ currentPage + 1 }}
        </PaginationLink>
      </PaginationItem>
      <PaginationItem v-if="totalPages > currentPage + 1">
        <PaginationEllipsis />
      </PaginationItem>
      <PaginationItem v-if="currentPage < totalPages">
        <PaginationNext :href="createHref(totalPages)" />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
</template>
