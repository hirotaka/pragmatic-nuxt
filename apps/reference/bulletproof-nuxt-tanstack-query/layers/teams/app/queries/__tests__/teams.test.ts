import { beforeEach, expect, test, vi } from "vitest";
import { TEAM_QUERY_KEYS, teamsQuery } from "../teams";
import type { Team } from "#layers/auth/shared/types";

const { api } = vi.hoisted(() => ({ api: vi.fn() }));

vi.mock("#app", async importOriginal => ({
  ...await importOriginal<typeof import("#app")>(),
  useNuxtApp: () => ({ $api: api }),
}));

beforeEach(() => {
  api.mockReset();
});

test("defines the anonymous Teams collection query and forwards its signal", async () => {
  const teams = [{
    id: "team-1",
    name: "Team",
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z",
  }] satisfies Team[];
  const signal = new AbortController().signal;
  api.mockResolvedValue(teams);
  const options = teamsQuery();
  if (typeof options.queryFn !== "function") throw new Error("Teams query function is unavailable");

  await expect(options.queryFn({ signal } as never)).resolves.toBe(teams);
  expect(options.queryKey).toEqual(TEAM_QUERY_KEYS.all);
  expect(api).toHaveBeenCalledWith("/api/teams", { signal });
});

test("preserves a successful empty Teams collection", async () => {
  const signal = new AbortController().signal;
  api.mockResolvedValue([]);
  const options = teamsQuery();
  if (typeof options.queryFn !== "function") throw new Error("Teams query function is unavailable");

  await expect(options.queryFn({ signal } as never)).resolves.toEqual([]);
});
