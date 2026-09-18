import type { QueryClient } from "@tanstack/vue-query";
import { expect, test, vi } from "vitest";

function captureConfiguredClient(configureNuxtQuery: typeof import("../vue-query").configureNuxtQuery) {
  let queryClient: QueryClient | undefined;
  const hook = vi.fn((_name, configure: (setQueryClient: (client: QueryClient) => void) => void) => {
    configure((client) => {
      queryClient = client;
    });
  });

  configureNuxtQuery({ hook } as never);

  expect(hook).toHaveBeenCalledWith("nuxt-query:configure", expect.any(Function));
  expect(queryClient).toBeDefined();
  return queryClient!;
}

test("supplies the app QueryClient defaults through the module configure hook", async () => {
  const { configureNuxtQuery } = await import("../vue-query");
  const queryClient = captureConfiguredClient(configureNuxtQuery);

  expect(queryClient.getDefaultOptions().queries).toEqual({
    staleTime: 60_000,
  });
});

test("routes Mutation failures through the configured QueryClient error owner", async () => {
  const { createQueryClient } = await import("../vue-query");
  const onMutationError = vi.fn();
  const queryClient = createQueryClient(onMutationError);
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: () => Promise.reject(new Error("Mutation failed")),
  });

  await expect(mutation.execute(undefined)).rejects.toThrow("Mutation failed");
  expect(onMutationError).toHaveBeenCalledOnce();
});

test.runIf(import.meta.server)("creates a distinct QueryClient for every server plugin execution", async () => {
  const { configureNuxtQuery } = await import("../vue-query");

  const firstClient = captureConfiguredClient(configureNuxtQuery);
  const secondClient = captureConfiguredClient(configureNuxtQuery);

  expect(firstClient).not.toBe(secondClient);
});
