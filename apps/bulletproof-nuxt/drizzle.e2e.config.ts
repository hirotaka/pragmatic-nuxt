import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for the E2E database config");
}

export default defineConfig({
  dialect: "sqlite",
  schema: "./server/db/schema.ts",
  dbCredentials: {
    url: databaseUrl,
  },
});
