import { PiniaColadaDelayQuery } from "@pinia/colada-plugin-delay";
import { ref } from "vue";
import { beforeEach, expect, test, vi } from "vitest";

interface DelayEntry {
  options: { delay?: number | false };
  asyncStatus: ReturnType<typeof ref<"idle" | "loading">>;
  ext: Record<string, { value: boolean }>;
}

const createPluginHarness = (entry: DelayEntry) => {
  let onAction: ((action: { name: string; args: unknown[] }) => void) | undefined;
  const plugin = PiniaColadaDelayQuery({ delay: 200 });

  plugin({
    queryCache: {
      $onAction: (callback: typeof onAction) => {
        onAction = callback;
      },
    },
    scope: {
      run: (callback: () => void) => callback(),
    },
  } as never);

  onAction?.({ name: "extend", args: [entry] });
  return entry;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

test("delays Query asyncStatus loading until the threshold", () => {
  const entry = createPluginHarness({
    options: {},
    asyncStatus: ref("idle"),
    ext: {},
  });

  entry.asyncStatus.value = "loading";

  expect(entry.asyncStatus.value).toBe("idle");
  expect(entry.ext.isDelaying.value).toBe(true);

  vi.advanceTimersByTime(199);
  expect(entry.asyncStatus.value).toBe("idle");

  vi.advanceTimersByTime(1);
  expect(entry.asyncStatus.value).toBe("loading");
  expect(entry.ext.isDelaying.value).toBe(false);
});

test("clears a pending delay when the Query settles early", () => {
  const entry = createPluginHarness({
    options: {},
    asyncStatus: ref("idle"),
    ext: {},
  });

  entry.asyncStatus.value = "loading";
  entry.asyncStatus.value = "idle";
  vi.advanceTimersByTime(200);

  expect(entry.asyncStatus.value).toBe("idle");
  expect(entry.ext.isDelaying.value).toBe(false);
});

test("honors a Query-level zero-delay opt-out", () => {
  const entry = createPluginHarness({
    options: { delay: 0 },
    asyncStatus: ref("idle"),
    ext: {},
  });

  entry.asyncStatus.value = "loading";

  expect(entry.asyncStatus.value).toBe("loading");
  expect(entry.ext.isDelaying.value).toBe(false);
});
