import { QueryClient } from "@tanstack/vue-query";
import { expect, test, vi } from "vitest";
import { authenticatedQueryMeta } from "#layers/base/app/queries/queryPolicy";
import { runServerStateSessionTransition } from "../useServerStateSessionBoundary";

test("cancels authenticated work and removes authenticated queries after success", async () => {
  const queryClient = new QueryClient();
  const authenticatedKey = ["discussions"] as const;
  const publicKey = ["public"] as const;
  let aborted = false;
  const pendingQuery = queryClient.fetchQuery({
    queryKey: authenticatedKey,
    meta: authenticatedQueryMeta(),
    queryFn: ({ signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        aborted = true;
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
    }),
  });
  void pendingQuery.catch(() => undefined);
  queryClient.setQueryData(publicKey, "public-data");
  const transitions: boolean[] = [];
  const operation = vi.fn().mockResolvedValue(undefined);

  await runServerStateSessionTransition({
    operation,
    queryClient,
    setTransitioning: value => transitions.push(value),
  });

  expect(aborted).toBe(true);
  expect(operation).toHaveBeenCalledOnce();
  expect(queryClient.getQueryData(authenticatedKey)).toBeUndefined();
  expect(queryClient.getQueryData(publicKey)).toBe("public-data");
  expect(transitions).toEqual([true, false]);
});

test("retains authenticated queries and re-enables reads when the session transition fails", async () => {
  const queryClient = new QueryClient();
  const authenticatedKey = ["users"] as const;
  queryClient.setQueryData(authenticatedKey, "user-data");
  const transitions: boolean[] = [];
  const error = new Error("Logout failed");

  await expect(runServerStateSessionTransition({
    operation: () => Promise.reject(error),
    queryClient,
    setTransitioning: value => transitions.push(value),
  })).rejects.toBe(error);

  expect(queryClient.getQueryData(authenticatedKey)).toBe("user-data");
  expect(transitions).toEqual([true, false]);
});
