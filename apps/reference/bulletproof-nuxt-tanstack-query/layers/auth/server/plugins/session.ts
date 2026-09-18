import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { serializeUser } from "~auth/server/utils/serializeUser";

export default defineNitroPlugin(() => {
  sessionHooks.hook("fetch", async (session) => {
    const identity = session.user;
    if (!identity) return;

    if (typeof identity.id !== "string" || identity.id.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const user = await createUserRepository().findById(identity.id);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    session.user = serializeUser(user);
  });
});
