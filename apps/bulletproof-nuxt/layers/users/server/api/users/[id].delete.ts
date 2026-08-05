import { createUserRepository } from "~users/server/repository/userRepository";
import type { User } from "#layers/auth/shared/types";

export default defineEventHandler(async (event) => {
  const sessionUser = (await requireUserSession(event)).user as User;

  if (sessionUser.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
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
      statusCode: 409,
      statusMessage: "Cannot delete your own account",
    });
  }

  const userRepository = createUserRepository();

  const deleted = await userRepository.delete(userId, sessionUser.teamId);
  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  setResponseStatus(event, 204);
});
