import { describe, expect, it, vi } from "vitest";
import { main } from "../seed-cli.mjs";

describe("seed CLI", () => {
  it("runs the database seed and prints the result", async () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    await main(async () => ({ teamsCreated: 2, usersCreated: 2 }));

    expect(consoleLog).toHaveBeenCalledWith("Database seeded successfully:", {
      teamsCreated: 2,
      usersCreated: 2,
    });
    consoleLog.mockRestore();
  });

  it("prints failures and exits unsuccessfully", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    process.exitCode = 0;

    await main(async () => {
      throw new Error("Seed collision");
    });

    expect(consoleError).toHaveBeenCalledWith("Failed to seed database: Seed collision");
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
    consoleError.mockRestore();
  });
});
