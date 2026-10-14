import { createUserRepository } from "#layers/users/server/repository/userRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
  assertAdmin(sessionUser);

  const userId = getRouterParam(event, "id");

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  assertNotSelfDelete(sessionUser, userId);

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
