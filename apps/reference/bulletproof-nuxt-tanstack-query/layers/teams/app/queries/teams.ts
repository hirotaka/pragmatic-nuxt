import { useNuxtApp } from "#app";
import { queryOptions } from "@tanstack/vue-query";
import type { Team } from "#layers/auth/shared/types";

export const TEAM_QUERY_KEYS = {
  all: ["teams"] as const,
};

export function teamsQuery() {
  const { $api } = useNuxtApp();

  return queryOptions({
    queryKey: TEAM_QUERY_KEYS.all,
    queryFn: ({ signal }): Promise<Team[]> => $api<Team[]>("/api/teams", { signal }),
  });
}
