import type { EventHandler } from "h3";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { currentUser, requireCurrentUser } = vi.hoisted(() => ({
  currentUser: {
    id: "user-1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "USER" as const,
    teamId: "team-1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  requireCurrentUser: vi.fn(),
}));

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(entryPath);
    return entry.isFile() && [".ts", ".vue"].some(extension => entry.name.endsWith(extension)) ? [entryPath] : [];
  }));
  return files.flat();
}

async function collectRouteFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectRouteFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
  }));

  return files.flat();
}

describe("defineAuthenticatedEventHandler", () => {
  beforeEach(() => {
    requireCurrentUser.mockReset().mockResolvedValue(currentUser);
    // Direct unit imports do not run Nitro's auto-import transform.
    vi.stubGlobal("requireCurrentUser", requireCurrentUser);
    vi.stubGlobal("defineEventHandler", <T>(handler: T) => handler);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves the database current user before invoking the handler", async () => {
    const { defineAuthenticatedEventHandler } = await import("../utils/defineAuthenticatedEventHandler");
    const event = { path: "/api/discussions" };
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const protectedHandler = defineAuthenticatedEventHandler(handler) as EventHandler;

    await expect(protectedHandler(event as never)).resolves.toEqual({ ok: true });
    expect(requireCurrentUser).toHaveBeenCalledWith(event);
    expect(handler).toHaveBeenCalledWith(event, currentUser);
    expect(requireCurrentUser.mock.invocationCallOrder[0]!).toBeLessThan(handler.mock.invocationCallOrder[0]!);
  });

  it("does not invoke the handler when authentication fails", async () => {
    const { defineAuthenticatedEventHandler } = await import("../utils/defineAuthenticatedEventHandler");
    const authenticationError = new Error("Unauthorized");
    const handler = vi.fn();
    requireCurrentUser.mockRejectedValue(authenticationError);
    const protectedHandler = defineAuthenticatedEventHandler(handler) as EventHandler;

    await expect(protectedHandler({} as never)).rejects.toBe(authenticationError);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("server route authentication structure", () => {
  it("requires authentication for every server API route unless it is explicitly public", async () => {
    const appDirectory = process.cwd();
    const layersDirectory = resolve(appDirectory, "layers");
    const layerEntries = await readdir(layersDirectory, { withFileTypes: true });
    const routeFiles = [
      ...(await collectRouteFiles(resolve(appDirectory, "server/api"))),
      ...(await Promise.all(layerEntries
        .filter(entry => entry.isDirectory())
        .map(entry => collectRouteFiles(join(layersDirectory, entry.name, "server/api")))))
        .flat(),
    ];
    const routePaths = routeFiles.map(routeFile => relative(appDirectory, routeFile));
    const publicRoutes = new Set([
      "layers/auth/server/api/auth/login.post.ts",
      "server/api/register.post.ts",
      "layers/teams/server/api/teams.get.ts",
    ]);

    for (const publicRoute of publicRoutes) {
      expect(routePaths).toContain(publicRoute);
    }

    for (const routeFile of routeFiles) {
      const source = await readFile(routeFile, "utf8");
      const routePath = relative(appDirectory, routeFile);

      if (publicRoutes.has(routePath)) {
        expect(source, routePath).toContain("export default defineEventHandler(");
        continue;
      }

      expect(source, routePath).toContain("export default defineAuthenticatedEventHandler(");
      expect(source, routePath).not.toContain("export default defineEventHandler(");
    }
  });
});

describe("layer dependency boundaries", () => {
  it("keeps cross-layer implementation imports out of feature layers", async () => {
    const layersDirectory = resolve(process.cwd(), "layers");
    const layerEntries = await readdir(layersDirectory, { withFileTypes: true });
    for (const layer of layerEntries.filter(entry => entry.isDirectory())) {
      const files = await collectSourceFiles(join(layersDirectory, layer.name));
      for (const file of files) {
        if (file.includes("/__tests__/")) continue;
        const source = await readFile(file, "utf8");
        const imports = [...source.matchAll(/#layers\/([\w-]+)/g)].map(match => match[1]);
        expect(imports, relative(process.cwd(), file)).toEqual(imports.filter(name => name === layer.name));
        expect(source, relative(process.cwd(), file)).not.toMatch(/from ["'](?:#server|#shared|~~\/app\/|~~\/server\/|~~\/shared\/)/);
      }
    }
  });
});
