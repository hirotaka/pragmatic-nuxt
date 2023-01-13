<script setup lang="tsx">
import FeatureDiscussionDelete from "./FeatureDiscussionDelete.vue";
import BaseLink from "@/components/base/BaseLink.vue";

const { data, isLoading } = useDiscussions();

const columns = [
  {
    title: "Title",
    field: "title",
  },
  {
    title: "Created At",
    field: "createdAt",
    Cell({ entry: { createdAt } }) {
      return <span>{formatDate(createdAt)}</span>;
    },
  },
  {
    title: "",
    field: "id",
    Cell({ entry: { id } }) {
      return <BaseLink to={`/main/discussions/${id}`}>View</BaseLink>;
    },
  },
  {
    title: "",
    field: "id",
    Cell({ entry: { id } }) {
      return id ? <FeatureDiscussionDelete id={id} /> : null;
    },
  },
];
</script>

<template>
  <AppSuspense :is-loading="isLoading">
    <template #fallback>
      <div class="w-full h-48 flex justify-center items-center">
        <BaseSpinner size="lg" />
      </div>
    </template>
    <BaseTable :data="data" :columns="columns" />
  </AppSuspense>
</template>
