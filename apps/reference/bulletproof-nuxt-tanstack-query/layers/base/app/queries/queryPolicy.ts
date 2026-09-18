import type { Query } from "@tanstack/vue-query";

export function authenticatedQueryMeta() {
  return { authenticated: true } as const;
}

export function authenticatedMutationMeta() {
  return { authenticated: true } as const;
}

export function isAuthenticatedQuery(query: Query): boolean {
  return query.meta?.authenticated === true;
}

export function getQueryErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { status?: unknown; statusCode?: unknown };
  const status = candidate.statusCode ?? candidate.status;
  return typeof status === "number" ? status : undefined;
}

export function isTerminalAuthenticationError(error: unknown): boolean {
  return getQueryErrorStatus(error) === 401;
}
