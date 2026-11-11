import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useDocsSearch } from "~/composables/useDocsSearch";

const { useSearchCollectionMock } = vi.hoisted(() => ({
  useSearchCollectionMock: vi.fn<typeof useSearchCollection>(),
}));
mockNuxtImport("useSearchCollection", () => useSearchCollectionMock);

type SearchSource = ReturnType<typeof useSearchCollection>;
type SearchResults = Awaited<ReturnType<SearchSource["search"]>>;
const hit: SearchResults[number] = {
  id: "/docs/guide#usage", title: "Usage", titles: ["Guide"],
  content: "Using documentation search.", collection: "docs", level: 2, rank: -1,
};
let scope: ReturnType<typeof effectScope>;
let source: SearchSource;

beforeEach(() => {
  vi.resetAllMocks();
  scope = effectScope();
  source = {
    status: ref("idle"),
    init: vi.fn(async () => { source.status.value = "ready"; }),
    search: vi.fn(async () => []),
  };
  useSearchCollectionMock.mockReturnValue(source);
});
afterEach(() => scope.stop());

it("initializes lazily once and searches only the latest input after indexing", async () => {
  const indexing = Promise.withResolvers<undefined>();
  vi.mocked(source.init).mockImplementation(() => indexing.promise.then(() => {
    source.status.value = "ready";
  }));
  await scope.run(async () => {
    const search = useDocsSearch();
    expect(useSearchCollectionMock).toHaveBeenCalledWith("docs", { immediate: false });
    expect(source.init).not.toHaveBeenCalled();
    search.open.value = true;
    search.query.value = "old";
    search.query.value = "latest";
    expect(search.initializing.value).toBe(true);
    expect(source.search).not.toHaveBeenCalled();
    indexing.resolve(undefined);
    await flushPromises();
    expect(source.init).toHaveBeenCalledTimes(1);
    expect(source.search).toHaveBeenCalledExactlyOnceWith("latest", { fields: ["title", "content"], minTermLength: 1 });
    expect(search.busy.value).toBe(false);
  });
});

it("keeps result order and ignores completions from older queries and closed dialogs", async () => {
  const older = Promise.withResolvers<SearchResults>();
  const newer = Promise.withResolvers<SearchResults>();
  const pending = Promise.withResolvers<SearchResults>();
  vi.mocked(source.search).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise).mockReturnValueOnce(pending.promise);
  await scope.run(async () => {
    const search = useDocsSearch();
    search.open.value = true;
    search.query.value = "older";
    await flushPromises();
    search.query.value = "newer";
    await flushPromises();
    newer.resolve([{ ...hit, id: "/docs/z" }, { ...hit, id: "/docs/a" }]);
    await flushPromises();
    older.resolve([hit]);
    await flushPromises();
    expect(search.items.value.map(item => item.id)).toEqual(["/docs/z", "/docs/a"]);
    search.query.value = "pending";
    await flushPromises();
    search.open.value = false;
    search.open.value = true;
    pending.resolve([hit]);
    await flushPromises();
    expect(search.query.value).toBe("");
    expect(search.items.value).toEqual([]);
  });
});

it("preserves initialization failure across close and reopen without retrying", async () => {
  const indexing = Promise.withResolvers<undefined>();
  vi.mocked(source.init).mockImplementation(() => indexing.promise.catch((error) => {
    source.status.value = "error";
    throw error;
  }));
  await scope.run(async () => {
    const search = useDocsSearch();
    search.open.value = true;
    search.open.value = false;
    indexing.reject(new Error("WASM unavailable"));
    await flushPromises();
    search.open.value = true;
    expect(search.error.value).toBe(true);
    expect(search.busy.value).toBe(false);
    expect(source.init).toHaveBeenCalledTimes(1);
    expect(source.search).not.toHaveBeenCalled();
  });
});

it("exposes a rejected search as failure rather than an empty successful result", async () => {
  vi.mocked(source.search).mockRejectedValue(new Error("Query unavailable"));
  await scope.run(async () => {
    const search = useDocsSearch();
    search.open.value = true;
    search.query.value = "query";
    await flushPromises();
    expect(search.error.value).toBe(true);
    expect(search.busy.value).toBe(false);
    expect(search.items.value).toEqual([]);
  });
});
