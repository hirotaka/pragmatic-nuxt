import { createUserRepository } from "~users/server/repository/userRepository";
import { requireCurrentUser } from "#layers/auth/server/utils/requireCurrentUser";

export default defineEventHandler(async (event) => {
  const sessionUser = await requireCurrentUser(event);

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
