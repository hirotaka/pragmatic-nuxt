import { expect } from "vitest";
import { setupRequestTests } from "~~/test/support/request";

const { test, request } = setupRequestTests();

// Success.

test("200: returns an empty team list without authentication", async () => {
  const response = await request("/api/teams");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([]);
});

test("200: lists teams newest-first without authentication using public fields and ISO datetimes", async ({ db }) => {
  const { teamFactory } = await import("~~/test/factories/team");
  const factory = teamFactory(db);
  const newest = await factory.create({
    name: "Newest team",
    createdAt: new Date("2026-01-03T01:02:03.000Z"),
    updatedAt: new Date("2026-01-04T04:05:06.000Z"),
  });
  const oldest = await factory.create({
    name: "Oldest team",
    createdAt: new Date("2026-01-01T01:02:03.000Z"),
    updatedAt: new Date("2026-01-05T04:05:06.000Z"),
  });
  const middle = await factory.create({
    name: "Middle team",
    createdAt: new Date("2026-01-02T01:02:03.000Z"),
    updatedAt: new Date("2026-01-06T04:05:06.000Z"),
  });

  const response = await request("/api/teams");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([
    {
      id: newest.id,
      name: "Newest team",
      createdAt: "2026-01-03T01:02:03.000Z",
      updatedAt: "2026-01-04T04:05:06.000Z",
    },
    {
      id: middle.id,
      name: "Middle team",
      createdAt: "2026-01-02T01:02:03.000Z",
      updatedAt: "2026-01-06T04:05:06.000Z",
    },
    {
      id: oldest.id,
      name: "Oldest team",
      createdAt: "2026-01-01T01:02:03.000Z",
      updatedAt: "2026-01-05T04:05:06.000Z",
    },
  ]);
});
