export async function main(seedDatabase, hashPassword) {
  try {
    const seed = seedDatabase ?? (await import("./seed.ts")).seedDatabase;
    const producer = hashPassword ?? (await import("./standalonePassword.ts")).hashStandalonePassword;
    const result = await seed(producer);
    console.log("Database seeded successfully:", result);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to seed database: ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1]?.endsWith("server/db/seed-cli.mjs")) {
  await main();
}
