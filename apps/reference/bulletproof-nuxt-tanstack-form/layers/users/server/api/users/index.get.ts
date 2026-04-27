import { createUserRepository } from "~users/server/repository/userRepository";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const sessionUser = session.user as SessionUser;

  if (sessionUser.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden - Admin access required",
    });
  }

  const userRepository = await createUserRepository(event);

  const users = await userRepository.findAll(sessionUser.teamId as string);

  return {
    data: users,
  };
});
