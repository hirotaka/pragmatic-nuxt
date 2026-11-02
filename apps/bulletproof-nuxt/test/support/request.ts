import type { ModuleOptions } from "@nuxthub/core";
import { randomBytes, randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createTest } from "@nuxt/test-utils/e2e";
import { getSession } from "h3";
import { afterAll, afterEach, beforeAll, beforeEach, test as base } from "vitest";

type Database = typeof import("@nuxthub/db").db;
type RequestApp = {
  localFetch: (path: string, init?: RequestInit) => Promise<Response>;
  db: Database;
  schema: typeof import("@nuxthub/db/schema");
  hash: (password: string) => Promise<string>;
  repositories: typeof import("./requestRuntime").repositories;
  close: () => Promise<void>;
};

export function json(method: "POST" | "PATCH", body: unknown): RequestInit {
  return { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

export function setupRequestTests() {
  const rootDir = fileURLToPath(new URL("../../", import.meta.url));
  const buildDir = join(rootDir, ".nuxt/test", randomUUID());
  const directory = join(tmpdir(), `bulletproof-request-${randomUUID()}`);
  const password = randomBytes(32).toString("hex");
  const previousPassword = process.env.NUXT_SESSION_PASSWORD;
  const previousFetch = globalThis.$fetch;
  let app: RequestApp | undefined;

  const hub: ModuleOptions = {
    dir: join(directory, "hub"),
    db: {
      dialect: "sqlite",
      driver: "libsql",
      connection: { url: `file:${join(directory, "hub/db/sqlite.db")}` },
      applyMigrationsDuringBuild: true,
    },
  };
  const nuxtConfig = {
    // Request specs exercise Nitro APIs; Vue rendering stays in the E2E lifecycle.
    builder: { bundle: async () => {} },
    experimental: { noVueServer: true },
    nitro: {
      preset: "node",
      entry: fileURLToPath(new URL("./requestRuntime.ts", import.meta.url)),
    },
    runtimeConfig: { session: { password } },
    hub,
  };
  const lifecycle = createTest({ rootDir, buildDir, browser: false, server: false, build: true, nuxtConfig });

  beforeAll(async () => {
    process.env.NUXT_SESSION_PASSWORD = password;
    await lifecycle.beforeAll();
    app = await import(/* @vite-ignore */ pathToFileURL(join(buildDir, "output/server/index.mjs")).href);
  }, lifecycle.ctx.options.setupTimeout);
  beforeEach(lifecycle.beforeEach);
  afterEach(lifecycle.afterEach);
  afterAll(async () => {
    try {
      await app?.close();
    }
    finally {
      try {
        await lifecycle.afterAll();
      }
      finally {
        globalThis.$fetch = previousFetch;
        if (previousPassword === undefined) delete process.env.NUXT_SESSION_PASSWORD;
        else process.env.NUXT_SESSION_PASSWORD = previousPassword;
        await rm(directory, { recursive: true, force: true });
        await rm(buildDir, { recursive: true, force: true });
      }
    }
  });

  function runtime() {
    if (!app) throw new Error("Request app has not been initialized");
    return app;
  }

  const test = base.extend<{ db: Database; repositories: RequestApp["repositories"] }>({
    repositories: async ({ db }, use) => {
      // Tie direct repository access to the disposable database lifecycle.
      void db;
      await use(runtime().repositories);
    },
    db: [async ({ onTestFinished }, use) => {
      const { db, schema } = runtime();
      onTestFinished(async () => {
        // This app has its own disposable database; preserve migration bookkeeping.
        await db.delete(schema.comments);
        await db.delete(schema.discussions);
        await db.delete(schema.users);
        await db.delete(schema.teams);
      });
      await use(db);
    }, { auto: true }],
  });
  const request = (path: string, init?: RequestInit) => runtime().localFetch(path, init);
  const post = (path: string, body: unknown) => request(path, json("POST", body));
  const sessionData = async (response: Response) => {
    const cookie = response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    // Read the actual sealed cookie with H3, without running session-fetch enrichment.
    const { data } = await getSession(
      { headers: new Headers({ cookie }), context: {} },
      { name: "nuxt-session", password },
    );
    return data;
  };

  const hashPassword = (password: string) => runtime().hash(password);

  return { test, request, post, sessionData, hashPassword };
}
