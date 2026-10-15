import { seedDatabase } from "#server/db/seed";

export default defineTask({
  meta: {
    name: "db:seed",
    description: "Seed the disposable Local database with demo Teams and Users",
  },
  async run() {
    return { result: await seedDatabase(hashPassword) };
  },
});
