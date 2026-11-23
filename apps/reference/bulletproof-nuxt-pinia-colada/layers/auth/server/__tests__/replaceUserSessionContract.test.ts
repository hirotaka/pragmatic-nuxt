import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { fetch, setup } from "@nuxt/test-utils/e2e";
import { expect, test } from "vitest";

await setup({
  rootDir: fileURLToPath(new URL("../../../../test/fixtures/session-contract", import.meta.url)),
  browser: false,
  nuxtConfig: { runtimeConfig: { appSecret: randomBytes(32).toString("base64") } },
});

test("creates an identity-only session and reads it on the next request", async () => {
  const creation = await fetch("/api/session", { method: "POST" });
  expect(creation.status).toBe(200);
  expect(creation.headers.getSetCookie()).toEqual([
    expect.stringMatching(/^nuxt-auth-session=[^;]+;/),
  ]);
  const session = await creation.json();
  expect(session).toEqual({
    id: expect.any(String),
    user: { id: "new-user" },
  });

  const cookie = creation.headers.getSetCookie().map(header => header.split(";", 1)[0]).join("; ");
  const nextRequest = await fetch("/api/session", { headers: { cookie } });
  expect(nextRequest.status).toBe(200);
  expect(await nextRequest.json()).toEqual(session);
});
