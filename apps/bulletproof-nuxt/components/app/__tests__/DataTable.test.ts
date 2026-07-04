import { expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import DataTable from "../DataTable.vue";

const columns = [
  { title: "Title", field: "title" },
  { title: "", field: "id", name: "action" },
] as const;

const rows = [
  { id: "1", title: "First discussion" },
  { id: "2", title: "Second discussion" },
];

test("DataTable renders an empty state", () => {
  render(DataTable, {
    props: {
      data: [],
      columns,
      emptyTitle: "No discussions found",
      emptyDescription: "Create your first discussion.",
    },
  });

  expect(screen.getByRole("heading", { name: "No discussions found" })).toBeTruthy();
  expect(screen.getByText("Create your first discussion.")).toBeTruthy();
});

test("DataTable renders default and custom cells", () => {
  render(DataTable, {
    props: {
      data: rows,
      columns,
    },
    slots: {
      "cell-action": `<template #default="{ entry }"><button>Open {{ entry.id }}</button></template>`,
    },
  });

  expect(screen.getByText("First discussion")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Open 1" })).toBeTruthy();
});

test("DataTable emits page changes", async () => {
  const user = userEvent.setup();
  const { emitted } = render(DataTable, {
    props: {
      data: rows,
      columns,
      pagination: {
        currentPage: 1,
        totalPages: 2,
      },
    },
  });

  await user.click(screen.getByRole("button", { name: /next page/i }));

  expect(emitted()["page-change"]).toEqual([[2]]);
});
