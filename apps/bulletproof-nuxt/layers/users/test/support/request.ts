import { setupRequestTests } from "~~/test/support/request";

type Database = typeof import("@nuxthub/db").db;

export function setupUserTests() {
  const { test: base, request, post, hashPassword } = setupRequestTests();

  async function createActors(db: Database) {
    const { teamFactory } = await import("~~/test/factories/team");
    const { userFactory } = await import("~~/test/factories/user");
    const team = await teamFactory(db).create();
    const otherTeam = await teamFactory(db).create();
    const plainPassword = "Password123!";
    const password = await hashPassword(plainPassword);

    async function actor(teamId: string, firstName: string, role: "USER" | "ADMIN", createdAt: Date) {
      const user = await userFactory(db, { teamId, password }).create({ firstName, role, createdAt, bio: "Original bio" });
      const login = await post("/api/auth/login", { email: user.email, password: plainPassword });
      if (login.status !== 204) throw new Error(`Actor login failed: ${login.status}`);
      const cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
      if (!cookie) throw new Error("Actor login did not create a session cookie");
      const authenticatedRequest = (path: string, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        headers.set("cookie", cookie);
        return request(path, { ...init, headers });
      };
      return { user, request: authenticatedRequest };
    }

    return {
      admin: await actor(team.id, "Admin", "ADMIN", new Date("2026-01-01T00:00:00.000Z")),
      member: await actor(team.id, "Member", "USER", new Date("2026-01-02T00:00:00.000Z")),
      outsider: await actor(otherTeam.id, "Outsider", "ADMIN", new Date("2026-01-03T00:00:00.000Z")),
    };
  }

  const test = base.extend<{ actors: Awaited<ReturnType<typeof createActors>> }>({
    actors: async ({ db }, use) => {
      await use(await createActors(db));
    },
  });
  return { test, request };
}
