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

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);

  await db.transaction(async (tx) => {
    const existingTeams = await tx.select().from(teams);
    const existingUsers = await tx.select().from(users);

    const expectedTeams = [
      { id: seedTeams.engineering, name: "Engineering" },
      { id: seedTeams.product, name: "Product" },
    ];
    const expectedUsers = [
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
    ];

    for (const expected of expectedTeams) {
      const byId = existingTeams.find(team => team.id === expected.id);
      const byName = existingTeams.find(team => team.name === expected.name);
      if ((byId && byId.name !== expected.name) || (byName && byName.id !== expected.id)) {
        throw new Error(`Seed collision for team ${expected.name}`);
      }
    }

    for (const expected of expectedUsers) {
      const byId = existingUsers.find(user => user.id === expected.id);
      const byEmail = existingUsers.find(user => user.email === expected.email);
      if (
        (byId && byId.email !== expected.email)
        || (byEmail && byEmail.id !== expected.id)
      ) {
        throw new Error(`Seed collision for user ${expected.email}`);
      }
    }

    for (const team of expectedTeams) {
      await tx
        .insert(teams)
        .values(team)
        .onConflictDoUpdate({ target: teams.id, set: { name: team.name } });
    }

    for (const user of expectedUsers) {
      const existing = existingUsers.find(item => item.id === user.id);
      await tx
        .insert(users)
        .values({ ...user, password: passwordHash })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            teamId: user.teamId,
            ...(existing ? {} : { password: passwordHash }),
          },
        });
    }
  });

  console.log("Seeded Engineering and Product teams with demo users.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
