import { defineQueryOptions } from "@pinia/colada";
import type { Team } from "~teams/shared/types";

export const TEAM_QUERY_KEYS = {
  all: ["teams"] as const,
};

export const teamsQuery = defineQueryOptions(() => {
  return {
    key: TEAM_QUERY_KEYS.all,
    query: ({ signal }) => {
      const { $api } = useNuxtApp();

      return $api<Team[]>("/api/teams", { signal });
    },
  };
});
