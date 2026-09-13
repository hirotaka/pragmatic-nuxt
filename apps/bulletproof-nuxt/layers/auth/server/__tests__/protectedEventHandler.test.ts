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

vi.mock("../utils/requireCurrentUser", () => ({ requireCurrentUser }));

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

describe("defineProtectedEventHandler", () => {
  beforeEach(() => {
    requireCurrentUser.mockReset().mockResolvedValue(currentUser);
    vi.stubGlobal("defineEventHandler", <T>(handler: T) => handler);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves the database current user before invoking the handler", async () => {
    const { defineProtectedEventHandler } = await import("../utils/defineProtectedEventHandler");
    const event = { path: "/api/discussions" };
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const protectedHandler = defineProtectedEventHandler(handler) as EventHandler;

    await expect(protectedHandler(event as never)).resolves.toEqual({ ok: true });
    expect(requireCurrentUser).toHaveBeenCalledWith(event);
    expect(handler).toHaveBeenCalledWith(event, currentUser);
    expect(requireCurrentUser.mock.invocationCallOrder[0]!).toBeLessThan(handler.mock.invocationCallOrder[0]!);
  });

  it("does not invoke the handler when authentication fails", async () => {
    const { defineProtectedEventHandler } = await import("../utils/defineProtectedEventHandler");
    const authenticationError = new Error("Unauthorized");
    const handler = vi.fn();
    requireCurrentUser.mockRejectedValue(authenticationError);
    const protectedHandler = defineProtectedEventHandler(handler) as EventHandler;

    await expect(protectedHandler({} as never)).rejects.toBe(authenticationError);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("protected server route structure", () => {
  it("requires authentication for every server API route unless it is explicitly public", async () => {
    const appDirectory = process.cwd();
    const layersDirectory = resolve(appDirectory, "layers");
    const layerEntries = await readdir(layersDirectory, { withFileTypes: true });
    const routeFiles = (await Promise.all(layerEntries
      .filter(entry => entry.isDirectory())
      .map(entry => collectRouteFiles(join(layersDirectory, entry.name, "server/api")))))
      .flat();
    const routePaths = routeFiles.map(routeFile => relative(appDirectory, routeFile));
    const publicRoutes = new Set([
      "layers/auth/server/api/auth/login.post.ts",
      "layers/auth/server/api/auth/register.post.ts",
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

      expect(source, routePath).toContain("export default defineProtectedEventHandler(");
      expect(source, routePath).not.toContain("export default defineEventHandler(");
    }
  });
});
