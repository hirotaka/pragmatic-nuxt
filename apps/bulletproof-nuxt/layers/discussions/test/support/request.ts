import { setupRequestTests } from "~~/test/support/request";

type Schema = typeof import("@nuxthub/db/schema");
type Database = typeof import("@nuxthub/db").db;
type User = Schema["users"]["$inferSelect"];
type Discussion = Schema["discussions"]["$inferSelect"];

export async function createDiscussion(db: Database, author: User, values: Partial<Schema["discussions"]["$inferInsert"]> = {}) {
  const { discussionFactory } = await import("~~/test/factories/discussion");
  const { id } = await discussionFactory(db, { authorId: author.id, teamId: author.teamId }).create(values);
  if (!id) throw new Error("Discussion factory did not return an ID");
  const saved = await db.query.discussions.findFirst({ where: (row, { eq }) => eq(row.id, id) });
  if (!saved) throw new Error("Discussion factory did not persist its record");
  return saved;
}

export async function createComment(db: Database, discussion: Discussion, author: User, values: Partial<Schema["comments"]["$inferInsert"]> = {}) {
  const { commentFactory } = await import("~~/test/factories/comment");
  const { id } = await commentFactory(db, { discussionId: discussion.id, authorId: author.id }).create(values);
  if (!id) throw new Error("Comment factory did not return an ID");
  const saved = await db.query.comments.findFirst({ where: (row, { eq }) => eq(row.id, id) });
  if (!saved) throw new Error("Comment factory did not persist its record");
  return saved;
}

export function setupDiscussionTests() {
  const { test: base, request, post, hashPassword } = setupRequestTests();

  async function createActors(db: Database) {
    const { teamFactory } = await import("~~/test/factories/team");
    const { userFactory } = await import("~~/test/factories/user");
    const team = await teamFactory(db).create();
    const otherTeam = await teamFactory(db).create();
    const plainPassword = "Password123!";
    const password = await hashPassword(plainPassword);

    async function actor(teamId: string, firstName: string, role: "USER" | "ADMIN" = "USER") {
      const user = await userFactory(db, { teamId, password }).create({ firstName, role });
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
      author: await actor(team.id, "Author"),
      member: await actor(team.id, "Member"),
      admin: await actor(team.id, "Admin", "ADMIN"),
      outsider: await actor(otherTeam.id, "Outsider", "ADMIN"),
    };
  }

  const test = base.extend<{ actors: Awaited<ReturnType<typeof createActors>> }>({
    actors: async ({ db }, use) => {
      await use(await createActors(db));
    },
  });
  return { test, request };
}
