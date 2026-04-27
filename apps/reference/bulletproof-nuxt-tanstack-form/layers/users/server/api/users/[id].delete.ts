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

  const userId = getRouterParam(event, "id");

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  if (userId === sessionUser.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot delete your own account",
    });
  }

  const userRepository = await createUserRepository(event);

  await userRepository.delete(userId);

  return {
    message: "User deleted successfully",
  };
});
