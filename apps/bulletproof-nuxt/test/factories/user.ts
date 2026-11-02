import type { Database } from "@praha/drizzle-factory";
import { randomUUID } from "node:crypto";
import { users } from "@nuxthub/db/schema";
import { defineFactory } from "@praha/drizzle-factory";

type UserDefaults = Pick<typeof users.$inferInsert, "teamId" | "password">;

// Require an existing team and a stored hash rather than inventing credential defaults.
export function userFactory(db: Database<{ users: typeof users }>, defaults: UserDefaults) {
  const factory = defineFactory({
    schema: { users },
    table: "users",
    resolver: () => ({
      id: randomUUID(),
      email: `user-${randomUUID()}@example.com`,
      firstName: "Test",
      lastName: "User",
      bio: null,
      role: "USER" as const,
      teamId: defaults.teamId,
      password: defaults.password,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
  });

  return factory(db);
}
