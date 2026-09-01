export type TableColumn<Entry> = {
  title: string;
  field: keyof Entry;
  name?: string;
  class?: string;
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
