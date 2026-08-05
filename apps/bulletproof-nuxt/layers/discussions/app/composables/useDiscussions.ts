import { useAPI } from "#layers/base/app/composables/useAPI";
import { usePaginatedData } from "#layers/base/app/composables/usePaginatedData";
import type { Discussion } from "~discussions/shared/types";

export async function useDiscussions(params: {
  page?: MaybeRefOrGetter<number>;
  limit?: MaybeRefOrGetter<number>;
} = {}) {
  const writablePage = isRef(params.page) && !isReadonly(params.page)
    ? params.page as Ref<number>
    : undefined;
  const page = writablePage ?? ref(toValue(params.page) ?? 1);
  const limit = computed(() => toValue(params.limit) ?? 10);

  if (params.page !== undefined && !writablePage) {
    watch(
      () => toValue(params.page),
      (nextPage) => {
        if (nextPage !== undefined && page.value !== nextPage) {
          page.value = nextPage;
        }
      },
      { flush: "sync" },
    );
  }

  const read = useAPI(
    "/api/discussions",
    {
      query: {
        page,
        limit,
      },
      watch: false,
    },
  );

  const pagination = usePaginatedData<Discussion>(read, {
    strategy: "replace",
    page,
  });

  watch(
    limit,
    () => {
      if (page.value === 1) {
        void pagination.loadPage(1);
      }
      else {
        page.value = 1;
      }
    },
    { flush: "sync" },
  );

  await read;
  return pagination;
}
