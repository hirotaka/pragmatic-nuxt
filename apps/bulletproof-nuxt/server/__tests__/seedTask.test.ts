import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { defineTask, hashPassword, seedDatabase } = vi.hoisted(() => ({
  defineTask: vi.fn((task: unknown) => task),
  hashPassword: vi.fn(),
  seedDatabase: vi.fn(),
}));

vi.mock("../db/seed", () => ({ seedDatabase }));

beforeEach(() => {
  defineTask.mockClear();
  hashPassword.mockReset();
  seedDatabase.mockReset().mockResolvedValue({});
  vi.stubGlobal("defineTask", defineTask);
  vi.stubGlobal("hashPassword", hashPassword);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("passes the official password primitive to the Local Nitro seed task", async () => {
  const { default: task } = await import("../tasks/db/seed");

  await task.run({} as Parameters<typeof task.run>[0]);

  expect(seedDatabase).toHaveBeenCalledWith(hashPassword);
});
