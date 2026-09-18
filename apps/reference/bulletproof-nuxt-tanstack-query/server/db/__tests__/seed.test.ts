import { Hash } from "@adonisjs/hash";
import { Scrypt } from "@adonisjs/hash/drivers/scrypt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { db, from, insert, insertValues, select, tx } = vi.hoisted(() => {
  const from = vi.fn();
  const insertValues = vi.fn();
  const select = vi.fn();
  const insert = vi.fn(() => ({ values: insertValues }));
  const tx = { select, insert };
  return {
    db: { transaction: vi.fn() },
    from,
    insert,
    insertValues,
    select,
    tx,
  };
});

vi.mock("@nuxthub/db", () => ({ db }));
vi.mock("@nuxthub/db/schema", () => ({ teams: {}, users: {} }));

const emptySeedRows = () => {
  from.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
  select.mockImplementation(() => ({ from }));
};

beforeEach(() => {
  db.transaction.mockReset().mockImplementation((callback: (transaction: typeof tx) => unknown) => callback(tx));
  from.mockReset();
  insert.mockClear();
  insertValues.mockReset();
  select.mockReset();
  vi.stubEnv("NITRO_PRESET", "");
  vi.stubEnv("CLOUDFLARE_ENV", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("seedDatabase", () => {
  it("shares Local database creation logic with an injected password producer", async () => {
    const { seedDatabase } = await import("../seed");
    const hashPassword = vi.fn().mockResolvedValue("$scrypt$seed-hash");
    emptySeedRows();

    await expect(seedDatabase(hashPassword)).resolves.toEqual({
      teamsCreated: 2,
      teamsExisting: 0,
      usersCreated: 2,
      usersExisting: 0,
    });

    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(insertValues).toHaveBeenCalledWith(expect.objectContaining({ password: "$scrypt$seed-hash" }));
  });

  it.each([
    ["NITRO_PRESET", "cloudflare_module"],
    ["CLOUDFLARE_ENV", "preview"],
  ] as const)("keeps the disposable-Local runtime guard before hash production for %s", async (name, value) => {
    const { seedDatabase } = await import("../seed");
    const hashPassword = vi.fn();
    vi.stubEnv(name, value);

    await expect(seedDatabase(hashPassword)).rejects.toThrow("available only for a disposable Local database");

    expect(hashPassword).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("keeps collision rejection and idempotent summaries in the shared seed function", async () => {
    const { expectedTeams, expectedUsers, seedDatabase } = await import("../seed");
    const hashPassword = vi.fn().mockResolvedValue("$scrypt$seed-hash");
    from.mockResolvedValueOnce([{ id: expectedTeams[0].id, name: "Different team" }]).mockResolvedValueOnce([]);
    select.mockImplementation(() => ({ from }));

    await expect(seedDatabase(hashPassword)).rejects.toThrow("Seed collision");

    from.mockReset().mockResolvedValueOnce([...expectedTeams]).mockResolvedValueOnce([...expectedUsers]);
    select.mockImplementation(() => ({ from }));
    await expect(seedDatabase(hashPassword)).resolves.toEqual({
      teamsCreated: 0,
      teamsExisting: 2,
      usersCreated: 0,
      usersExisting: 2,
    });
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("standalone password producer", () => {
  it("creates hashes accepted by the provider's default Scrypt configuration", async () => {
    const { hashStandalonePassword } = await import("../standalonePassword");
    const providerCompatibleHash = new Hash(new Scrypt({}));
    const hash = await hashStandalonePassword("password123");

    await expect(providerCompatibleHash.verify(hash, "password123")).resolves.toBe(true);
    await expect(providerCompatibleHash.verify(hash, "wrong-password")).resolves.toBe(false);
  });
});
