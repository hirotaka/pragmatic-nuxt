import { randomUUID } from "node:crypto";
import * as schema from "@nuxthub/db/schema";
import { eq } from "drizzle-orm";
import { hashStandalonePassword } from "~~/server/db/seed/standalonePassword";
import { teamFactory } from "~~/test/factories/team";
import { userFactory } from "~~/test/factories/user";
import { discussionFactory } from "~~/test/factories/discussion";
import { commentFactory } from "~~/test/factories/comment";
import { openE2EDatabase } from "~~/test/e2e/support/database";

type User = typeof schema.users.$inferSelect;
let discussionSequence = 0;

export function registrationInput() {
  const unique = randomUUID();
  return {
    firstName: "E2E",
    lastName: "Member",
    email: `registration-${unique}@example.com`,
    password: "Password123!",
    teamName: `Registration team ${unique}`,
  };
}

export async function createTeam(baseURL: string | undefined, name = `E2E team ${randomUUID()}`) {
  const db = await openE2EDatabase(baseURL);
  try {
    const id = randomUUID();
    await teamFactory(db).create({ id, name });
    const saved = await db.query.teams.findFirst({ where: eq(schema.teams.id, id) });
    if (!saved) throw new Error("Team factory did not persist its record");
    return saved;
  }
  finally {
    db.$client.close();
  }
}

export async function createAccount(baseURL: string | undefined, label: string, teamId: string, role: User["role"]) {
  const db = await openE2EDatabase(baseURL);
  try {
    const id = randomUUID();
    const password = "Password123!";
    await userFactory(db, { teamId, password: await hashStandalonePassword(password) }).create({
      id,
      email: `${label}-${randomUUID()}@example.com`,
      firstName: "Data",
      lastName: "Evidence",
      role,
    });
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
    if (!user) throw new Error("User factory did not persist its record");
    return { user, password };
  }
  finally {
    db.$client.close();
  }
}

export async function createDiscussion(baseURL: string | undefined, author: User, title: string, body = `${title} body`) {
  const db = await openE2EDatabase(baseURL);
  try {
    const id = randomUUID();
    const createdAt = new Date(Date.UTC(2026, 0, 1) + ++discussionSequence * 1000);
    await discussionFactory(db, { authorId: author.id, teamId: author.teamId }).create({ id, title, body, createdAt });
    const saved = await db.query.discussions.findFirst({ where: eq(schema.discussions.id, id) });
    if (!saved) throw new Error("Discussion factory did not persist its record");
    return saved;
  }
  finally {
    db.$client.close();
  }
}

export async function createComment(baseURL: string | undefined, author: User, discussionId: string, body: string) {
  const db = await openE2EDatabase(baseURL);
  try {
    return await commentFactory(db, { authorId: author.id, discussionId }).create({ id: randomUUID(), body });
  }
  finally {
    db.$client.close();
  }
}
