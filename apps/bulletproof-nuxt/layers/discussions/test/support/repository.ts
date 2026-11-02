import { setupRequestTests } from "~~/test/support/request";
import { createComment, createDiscussion } from "#layers/discussions/test/support/request";

type Database = typeof import("@nuxthub/db").db;

export function setupRepositoryTests() {
  const { test: base } = setupRequestTests();

  async function createRecords(db: Database) {
    const { teamFactory } = await import("~~/test/factories/team");
    const { userFactory } = await import("~~/test/factories/user");
    const team = await teamFactory(db).create();
    const otherTeam = await teamFactory(db).create();
    // These tests never authenticate; the stored password is not a login credential.
    const author = await userFactory(db, { teamId: team.id, password: "unused-in-repository-tests" }).create();
    const savedAuthor = await db.query.users.findFirst({ where: (row, { eq }) => eq(row.id, author.id) });
    if (!savedAuthor) throw new Error("User factory did not persist its record");
    const discussion = await createDiscussion(db, savedAuthor);
    const otherDiscussion = await createDiscussion(db, savedAuthor);
    const comment = await createComment(db, discussion, savedAuthor);
    const otherComment = await createComment(db, otherDiscussion, savedAuthor);
    return { team, otherTeam, discussion, otherDiscussion, comment, otherComment };
  }

  return base.extend<{ records: Awaited<ReturnType<typeof createRecords>> }>({
    records: async ({ db }, use) => {
      await use(await createRecords(db));
    },
  });
}
