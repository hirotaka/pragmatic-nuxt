import { QueryClient } from "@tanstack/vue-query";
import { expect, test, vi } from "vitest";
import {
  authenticatedMutationMeta,
  authenticatedQueryMeta,
} from "#layers/base/app/queries/queryPolicy";
import { observeTerminalSessionErrors } from "../vue-query-session.client";

const terminalError = (statusCode: number) => Object.assign(new Error("Request failed"), { statusCode });

async function failQuery(queryClient: QueryClient, statusCode: number, authenticated = true) {
  return queryClient.fetchQuery({
    queryKey: authenticated ? ["discussions"] : ["public"],
    queryFn: () => Promise.reject(terminalError(statusCode)),
    meta: authenticated ? authenticatedQueryMeta() : undefined,
    retry: false,
  }).catch(() => undefined);
}

async function failMutation(queryClient: QueryClient, statusCode: number, authenticated = true) {
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: () => Promise.reject(terminalError(statusCode)),
    meta: authenticated ? authenticatedMutationMeta() : undefined,
  });
  await mutation.execute(undefined).catch(() => undefined);
}

test("refreshes once for an authenticated 401 and removes authenticated queries before redirecting", async () => {
  const queryClient = new QueryClient();
  let loggedIn = true;
  const refreshSession = vi.fn(async () => {
    loggedIn = false;
  });
  const onLoggedOut = vi.fn().mockResolvedValue(undefined);
  const transitions: boolean[] = [];

  const unsubscribe = observeTerminalSessionErrors({
    queryClient,
    refreshSession,
    isLoggedIn: () => loggedIn,
    setTransitioning: value => transitions.push(value),
    onLoggedOut,
  });

  await Promise.all([
    failQuery(queryClient, 401),
    failQuery(queryClient, 401),
  ]);
  await vi.waitFor(() => expect(onLoggedOut).toHaveBeenCalledOnce());

  expect(refreshSession).toHaveBeenCalledOnce();
  expect(transitions).toEqual([true, false]);
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  unsubscribe();
});

test("uses the same single-flight session recovery for authenticated Query and Mutation 401 errors", async () => {
  const queryClient = new QueryClient();
  let loggedIn = true;
  let releaseRefresh!: () => void;
  const refreshSession = vi.fn(() => new Promise<void>((resolve) => {
    releaseRefresh = () => {
      loggedIn = false;
      resolve();
    };
  }));
  const onLoggedOut = vi.fn().mockResolvedValue(undefined);
  const unsubscribe = observeTerminalSessionErrors({
    queryClient,
    refreshSession,
    isLoggedIn: () => loggedIn,
    setTransitioning: vi.fn(),
    onLoggedOut,
  });

  await failMutation(queryClient, 401);
  await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());
  await failQuery(queryClient, 401);
  expect(refreshSession).toHaveBeenCalledOnce();

  releaseRefresh();
  await vi.waitFor(() => expect(onLoggedOut).toHaveBeenCalledOnce());
  unsubscribe();
});

test("leaves terminal Query error ownership in place when session refresh keeps the user logged in", async () => {
  const queryClient = new QueryClient();
  const refreshSession = vi.fn().mockResolvedValue(undefined);
  const onLoggedOut = vi.fn();

  const unsubscribe = observeTerminalSessionErrors({
    queryClient,
    refreshSession,
    isLoggedIn: () => true,
    setTransitioning: vi.fn(),
    onLoggedOut,
  });

  await failQuery(queryClient, 401);
  await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());

  const query = queryClient.getQueryCache().find({ queryKey: ["discussions"] });
  expect(query?.state.status).toBe("error");
  expect(onLoggedOut).not.toHaveBeenCalled();
  unsubscribe();
});

test("does not refresh a session for public errors or authorization denials", async () => {
  const queryClient = new QueryClient();
  const refreshSession = vi.fn();
  const unsubscribe = observeTerminalSessionErrors({
    queryClient,
    refreshSession,
    isLoggedIn: () => true,
    setTransitioning: vi.fn(),
    onLoggedOut: vi.fn(),
  });

  await failQuery(queryClient, 401, false);
  await failQuery(queryClient, 403);
  await failMutation(queryClient, 401, false);
  await failMutation(queryClient, 403);

  expect(refreshSession).not.toHaveBeenCalled();
  unsubscribe();
});
