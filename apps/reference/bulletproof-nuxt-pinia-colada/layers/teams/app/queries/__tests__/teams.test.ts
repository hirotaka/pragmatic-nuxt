import { beforeEach, expect, test, vi } from "vitest";
import { TEAM_QUERY_KEYS, teamsQuery } from "../teams";
import type { Team } from "~teams/shared/types";

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.mock("#imports", async importOriginal => ({
  ...await importOriginal<typeof import("#imports")>(),
  $fetch: fetchMock,
}));
vi.mock("#build/fetch.mjs", () => ({ $fetch: fetchMock }));
vi.mock("@pinia/colada", () => ({
  defineQueryOptions: (factory: unknown) => factory,
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));

beforeEach(() => {
  fetchMock.mockReset();
  Object.assign(useNuxtApp(), { $api: fetchMock });
});

test("defines the anonymous Teams collection query and forwards its signal", async () => {
  const teams = [{ id: "team-1", name: "Team", createdAt: "2026-08-12T00:00:00.000Z", updatedAt: "2026-08-12T00:00:00.000Z" }] satisfies Team[];
  const signal = new AbortController().signal;
  fetchMock.mockResolvedValue(teams);

  const options = teamsQuery() as unknown as {
    key: unknown;
    query: (context: { signal: AbortSignal }) => Promise<Team[]>;
  };

  await expect(options.query({ signal })).resolves.toBe(teams);
  expect(options.key).toEqual(TEAM_QUERY_KEYS.all);
  expect(fetchMock).toHaveBeenCalledWith("/api/teams", { signal });
});

test("preserves a successful empty Teams collection", async () => {
  const signal = new AbortController().signal;
  fetchMock.mockResolvedValue([]);
  const options = teamsQuery() as unknown as {
    query: (context: { signal: AbortSignal }) => Promise<Team[]>;
  };

  await expect(options.query({ signal })).resolves.toEqual([]);
});
