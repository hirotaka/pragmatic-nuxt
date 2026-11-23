import { db, schema } from "@nuxthub/db";
import { createDiscussionRepository } from "#layers/discussions/server/repository/discussionRepository";
import { createCommentRepository } from "#layers/discussions/server/repository/commentRepository";
import { useNitroApp } from "nitropack/runtime";
import { getSession } from "nuxt/server";

const app = useNitroApp();

export const localFetch = app.localFetch;
export const hash = (password: string) => hashPassword(password);
export { db, schema };

export async function readSessionData(cookie: string) {
  // Read the sealed cookie without running the provider's response enrichment hook.
  const { data } = await getSession({
    req: new Request("http://localhost/", { headers: { cookie } }),
    res: { headers: new Headers() },
  }, { name: "nuxt-auth-session" });
  return data;
}

// Direct persistence tests use the same composed runtime and database as request specs.
export const repositories = {
  discussions: createDiscussionRepository(),
  comments: createCommentRepository(),
};

export async function close() {
  // The fixture builds libSQL even when the app's generated types use another dialect.
  const client = db.$client;
  if (!("close" in client) || typeof client.close !== "function") {
    throw new Error("Request tests require the SQLite/libSQL client");
  }
  try {
    await app.hooks.callHook("close");
  }
  finally {
    client.close();
  }
}
