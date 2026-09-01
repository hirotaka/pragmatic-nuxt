import bcrypt from "bcryptjs";
import { db } from "@nuxthub/db";
import { teams, users } from "@nuxthub/db/schema";

const seedTeams = {
  engineering: "00000000-0000-4000-8000-000000000001",
  product: "00000000-0000-4000-8000-000000000002",
} as const;

const seedUsers = {
  admin: "00000000-0000-4000-8000-000000000011",
  user: "00000000-0000-4000-8000-000000000012",
} as const;

const password = "password123";

export const expectedTeams = [
  { id: seedTeams.engineering, name: "Engineering" },
  { id: seedTeams.product, name: "Product" },
] as const;

export const expectedUsers = [
  {
    id: seedUsers.admin,
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN" as const,
    teamId: seedTeams.engineering,
  },
  {
    id: seedUsers.user,
    email: "user@example.com",
    firstName: "Regular",
    lastName: "User",
    role: "USER" as const,
    teamId: seedTeams.product,
  },
] as const;

type SeedEnvironment = Record<string, string | undefined>;

export type SeedSummary = {
  teamsCreated: number;
  teamsExisting: number;
  usersCreated: number;
  usersExisting: number;
};

export function isNonLocalSeedRuntime(env: SeedEnvironment = process.env) {
  return env.NITRO_PRESET === "cloudflare_module" || Boolean(env.CLOUDFLARE_ENV);
}

export function findSeedCollisions(
  existingTeams: Array<{ id: string; name: string }>,
  existingUsers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "USER" | "ADMIN";
    teamId: string;
  }>,
) {
  const collisions: string[] = [];

  for (const expected of expectedTeams) {
    const byId = existingTeams.find(team => team.id === expected.id);
    const byName = existingTeams.find(team => team.name === expected.name);
    if (byId && (byId.name !== expected.name || (byName && byName.id !== expected.id))) {
      collisions.push(`team ${expected.name} has an incompatible identity`);
    }
    else if (byName && byName.id !== expected.id) {
      collisions.push(`team ${expected.name} is owned by another identity`);
    }
  }

  for (const expected of expectedUsers) {
    const byId = existingUsers.find(user => user.id === expected.id);
    const byEmail = existingUsers.find(user => user.email === expected.email);
    const existing = byId || byEmail;
    if (!existing) {
      continue;
    }

    const isCompatible = existing.id === expected.id
      && existing.email === expected.email
      && existing.firstName === expected.firstName
      && existing.lastName === expected.lastName
      && existing.role === expected.role
      && existing.teamId === expected.teamId;

    if (!isCompatible) {
      collisions.push(`user ${expected.email} has an incompatible identity`);
    }
  }

  return collisions;
}

export async function seedDatabase(): Promise<SeedSummary> {
  if (isNonLocalSeedRuntime()) {
    throw new Error("Database seed is available only for a disposable Local database.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return db.transaction(async (tx) => {
    const existingTeams = await tx.select().from(teams);
    const existingUsers = await tx.select().from(users);

    const collisions = findSeedCollisions(existingTeams, existingUsers);
    if (collisions.length > 0) {
      throw new Error(`Seed collision: ${collisions.join("; ")}`);
    }

    let teamsCreated = 0;
    let usersCreated = 0;

    for (const team of expectedTeams) {
      if (!existingTeams.some(existing => existing.id === team.id)) {
        await tx.insert(teams).values(team);
        teamsCreated += 1;
      }
    }

    for (const user of expectedUsers) {
      if (!existingUsers.some(existing => existing.id === user.id)) {
        await tx.insert(users).values({ ...user, password: passwordHash });
        usersCreated += 1;
      }
    }

    return {
      teamsCreated,
      teamsExisting: expectedTeams.length - teamsCreated,
      usersCreated,
      usersExisting: expectedUsers.length - usersCreated,
    };
  });
}
