import { randomUUID } from "node:crypto";
import { teams } from "@nuxthub/db/schema";
import { defineFactory } from "@praha/drizzle-factory";

export const teamFactory = defineFactory({
  schema: { teams },
  table: "teams",
  resolver: ({ sequence }) => ({
    id: randomUUID(),
    name: `Test team ${sequence}`,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  }),
});
