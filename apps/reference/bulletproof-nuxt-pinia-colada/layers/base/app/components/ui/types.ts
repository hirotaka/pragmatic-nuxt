/**
 * Table column definition for UTable component
 *
 * @example
 * const columns: TableColumn<User>[] = [
 *   { title: 'Name', field: 'firstName' },           // slot: #cell-firstName
 *   { title: '', field: 'id', name: 'delete' },      // slot: #cell-delete
 * ]
 */
export type TableColumn<Entry> = {
  /** Column header text */
  title: string;
  /** Field key from entry object */
  field: keyof Entry;
  /**
   * Custom slot name. If provided, use `#cell-{name}` for the slot.
   * Otherwise, slot name defaults to `#cell-{field}`.
   * Useful when multiple columns use the same field (e.g., actions).
   */
  name?: string;
};
