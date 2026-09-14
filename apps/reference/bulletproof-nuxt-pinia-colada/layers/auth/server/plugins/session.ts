import { createError } from "h3";
import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { serializeSessionUser } from "~auth/server/utils/serializeUser";
import type { SessionIdentity } from "~auth/shared/types";

export default defineNitroPlugin(() => {
  sessionHooks.hook("fetch", async (session) => {
    const identity = session.user as Partial<SessionIdentity> | null | undefined;
    if (identity === undefined || identity === null) return;
    if (typeof identity !== "object" || typeof identity.id !== "string" || identity.id.length === 0) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const user = await createUserRepository().findById(identity.id);
    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    session.user = serializeSessionUser(user);
  });
});
