import { computed, ref, shallowRef, watch } from "vue";

export function useDocsSearch() {
  const source = useSearchCollection("docs", { immediate: false });
  const open = ref(false);
  const query = ref("");
  const items = shallowRef<Awaited<ReturnType<typeof source.search>>>([]);
  const searching = ref(false);
  const failed = ref(false);
  const error = computed(() => failed.value || source.status.value === "error");
  const initializing = computed(() => open.value && !error.value && source.status.value !== "ready");
  const busy = computed(() => initializing.value || searching.value);
  let initialization: Promise<unknown> | undefined;

  watch([open, query], async ([isOpen, term], _, onCleanup) => {
    let current = true;
    onCleanup(() => {
      current = false;
    });
    items.value = [];
    searching.value = false;
    if (!isOpen) {
      query.value = "";
      return;
    }
    if (error.value) return;
    searching.value = Boolean(term.trim());
    try {
      await (initialization ??= source.init());
      if (!current || !term.trim()) return;
      const results = await source.search(term, { fields: ["title", "content"], minTermLength: 1 });
      if (current) items.value = results;
    }
    catch {
      if (current) failed.value = true;
    }
    finally {
      if (current) searching.value = false;
    }
  }, { flush: "sync" });

  return { open, query, items, initializing, busy, error };
}
