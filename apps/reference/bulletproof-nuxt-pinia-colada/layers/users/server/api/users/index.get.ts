import { createUserRepository } from "~users/server/repository/userRepository";
import { serializeUser } from "~users/server/utils/serializeUser";
import { requireCurrentUser } from "#layers/auth/server/utils/requireCurrentUser";

export default defineEventHandler(async (event) => {
  const sessionUser = await requireCurrentUser(event);

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
