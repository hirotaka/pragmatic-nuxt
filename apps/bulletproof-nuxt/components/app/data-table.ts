export type TableColumn<Entry> = {
  title: string;
  field: keyof Entry;
  name?: string;
};
