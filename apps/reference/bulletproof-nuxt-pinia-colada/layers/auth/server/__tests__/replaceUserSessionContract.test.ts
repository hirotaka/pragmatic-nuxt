import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createServer } from "node:http";
import { createApp, eventHandler, toNodeListener, type H3Event } from "h3";
import { afterEach, expect, test } from "vitest";

const require = createRequire(import.meta.url);
const nuxtAuthUtilsEntry = require.resolve("nuxt-auth-utils");
const authUtilsRequire = createRequire(nuxtAuthUtilsEntry);
const h3Entry = authUtilsRequire.resolve("h3");
const authUtilsSessionPath = join(dirname(nuxtAuthUtilsEntry), "runtime/server/utils/session.js");
const authUtilsPackagePath = join(dirname(nuxtAuthUtilsEntry), "../package.json");
const h3PackagePath = join(dirname(h3Entry), "../package.json");

type SessionUtils = {
  getUserSession: (event: H3Event) => Promise<Record<string, unknown>>;
  replaceUserSession: (event: H3Event, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

type SessionResponse = {
  session: Record<string, unknown>;
};

const servers: ReturnType<typeof createServer>[] = [];

const request = async (url: string, cookie?: string) => {
  const response = await fetch(url, {
    headers: cookie ? { cookie } : undefined,
  });
  const setCookie = response.headers.get("set-cookie");

  return {
    body: await response.json() as SessionResponse,
    cookie: setCookie?.split(";", 1)[0],
  };
};

const loadInstalledSessionUtils = async (): Promise<SessionUtils> => {
  const source = await readFile(authUtilsSessionPath, "utf8");
  const runtimeConfig = `const useRuntimeConfig = () => ({ session: { name: "auth-contract", password: "characterize-the-lockfile-session-contract", cookie: { secure: false } } });`;
  const moduleSource = source
    .replace(`import { useSession, createError, isEvent } from "h3";`, `import { useSession, createError, isEvent } from "${pathToFileURL(h3Entry).href}";`)
    .replace(`import { defu } from "defu";`, `import { defu } from "${pathToFileURL(authUtilsRequire.resolve("defu")).href}";`)
    .replace(`import { createHooks } from "hookable";`, `import { createHooks } from "${pathToFileURL(authUtilsRequire.resolve("hookable")).href}";`)
    .replace(`import { useRuntimeConfig } from "#imports";`, runtimeConfig);

  return import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`) as Promise<SessionUtils>;
};

const startServer = async (sessionUtils: SessionUtils) => {
  const app = createApp();

  app.use("/create", eventHandler(async (event) => {
    await sessionUtils.replaceUserSession(event, {
      user: { id: "new-user" },
    });

    return { session: await sessionUtils.getUserSession(event) };
  }));

  app.use("/read", eventHandler(async event => ({
    session: await sessionUtils.getUserSession(event),
  })));

  const server = createServer(toNodeListener(app));
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected the contract server to bind to a TCP address");
  }

  return `http://127.0.0.1:${address.port}`;
};

const closeServer = (server: ReturnType<typeof createServer>) => new Promise<void>((resolve, reject) => {
  server.close(error => error ? reject(error) : resolve());
});

afterEach(async () => {
  await Promise.all(servers.splice(0).map(closeServer));
});

// Existing cookies can retain stale fields in this locked tuple; compatibility is intentionally not required.
test("creates an identity-only session for the resolved nuxt-auth-utils 0.5.29 and h3 1.15.11 tuple", async () => {
  const [authUtilsPackage, h3Package] = await Promise.all([
    readFile(authUtilsPackagePath, "utf8").then(JSON.parse) as Promise<{ version: string }>,
    readFile(h3PackagePath, "utf8").then(JSON.parse) as Promise<{ version: string }>,
  ]);
  expect(authUtilsPackage.version).toBe("0.5.29");
  expect(h3Package.version).toBe("1.15.11");

  const sessionUtils = await loadInstalledSessionUtils();
  const baseUrl = await startServer(sessionUtils);

  const creation = await request(`${baseUrl}/create`);
  expect(creation.cookie).toBeDefined();
  expect(creation.body.session).toEqual({
    id: expect.any(String),
    user: { id: "new-user" },
  });

  const nextRequest = await request(`${baseUrl}/read`, creation.cookie);
  expect(nextRequest.body.session).toEqual({
    id: creation.body.session.id,
    user: { id: "new-user" },
  });
});
