import { createUserRepository } from "~users/server/repository/userRepository";
import { serializeUser } from "~users/server/utils/serializeUser";
import { defineProtectedEventHandler } from "#layers/auth/server/utils/defineProtectedEventHandler";

export default defineProtectedEventHandler(async (event, sessionUser) => {
  if (sessionUser.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  const userRepository = createUserRepository();

  const users = await userRepository.findAll(sessionUser.teamId as string);

  return users.map(serializeUser);
});
