import type { Team } from "#layers/auth/shared/types";
import { expect, expectTypeOf, test } from "vitest";
import { serializeTeam } from "../serializeTeam";

expectTypeOf<Team["createdAt"]>().toEqualTypeOf<string>();
expectTypeOf<Team["updatedAt"]>().toEqualTypeOf<string>();

test("serializes repository team datetimes as ISO strings", () => {
  const createdAt = new Date("2026-07-10T01:02:03.456Z");
  const updatedAt = new Date("2026-07-10T02:03:04.567Z");

  expect(serializeTeam({
    id: "team-1",
    name: "Analytical Engines",
    createdAt,
    updatedAt,
  })).toEqual({
    id: "team-1",
    name: "Analytical Engines",
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
});
