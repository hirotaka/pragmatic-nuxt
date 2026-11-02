import { Hash } from "@adonisjs/hash";
import { Scrypt } from "@adonisjs/hash/drivers/scrypt";
import { describe, expect, it } from "vitest";

describe("standalone password producer", () => {
  it("creates hashes accepted by the provider's default Scrypt configuration", async () => {
    const { hashStandalonePassword } = await import("~~/server/db/seed/standalonePassword");
    const providerCompatibleHash = new Hash(new Scrypt({}));
    const hash = await hashStandalonePassword("password123");

    await expect(providerCompatibleHash.verify(hash, "password123")).resolves.toBe(true);
    await expect(providerCompatibleHash.verify(hash, "wrong-password")).resolves.toBe(false);
  });
});
