import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { teams, users } from "./schema";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root (parent directory of db/)
const projectRoot = resolve(__dirname, "..");

// Create database connection for seeding
const databaseUrl = process.env.DATABASE_URL || "file:./db/dev.db";
const dbPath = databaseUrl.startsWith("file:")
  ? resolve(projectRoot, databaseUrl.replace("file:./", "").replace("file:", ""))
  : databaseUrl;

const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

async function main() {
  console.log("Seeding database...");

  // Create teams
  const [team1] = await db
    .insert(teams)
    .values({ name: "Engineering" })
    .onConflictDoUpdate({
      target: teams.name,
      set: { name: "Engineering" },
    })
    .returning();

  const [team2] = await db
    .insert(teams)
    .values({ name: "Product" })
    .onConflictDoUpdate({
      target: teams.name,
      set: { name: "Product" },
    })
    .returning();

  console.log("Created teams:", team1.name, team2.name);

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      password: hashedPassword,
      role: "ADMIN",
      teamId: team1.id,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        firstName: "Admin",
        lastName: "User",
        password: hashedPassword,
        role: "ADMIN",
        teamId: team1.id,
      },
    })
    .returning();

  const [user] = await db
    .insert(users)
    .values({
      email: "user@example.com",
      firstName: "Regular",
      lastName: "User",
      password: hashedPassword,
      role: "USER",
      teamId: team2.id,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        firstName: "Regular",
        lastName: "User",
        password: hashedPassword,
        role: "USER",
        teamId: team2.id,
      },
    })
    .returning();

  console.log("Created users:", admin.email, user.email);
  console.log("Password for all users: password123");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
