import { createUserRepository } from "~users/server/repository/userRepository";
import { serializeUser } from "#layers/auth/server/utils/serializeUser";
import type { User } from "#layers/auth/shared/types";

export default defineEventHandler(async (event) => {
  const sessionUser = (await requireUserSession(event)).user as User;

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
