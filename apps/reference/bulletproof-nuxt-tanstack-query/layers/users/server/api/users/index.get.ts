import { createUserRepository } from "~users/server/repository/userRepository";
import { serializeUser } from "#layers/auth/server/utils/serializeUser";
import { parsePagination } from "~base/server/utils/parsePagination";

export default defineProtectedEventHandler(async (event, sessionUser) => {
  if (sessionUser.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  const { page, limit } = parsePagination(getQuery(event));
  const userRepository = createUserRepository();
  const result = await userRepository.findAll({
    teamId: sessionUser.teamId as string,
    page,
    limit,
  });

  return {
    ...result,
    data: result.data.map(serializeUser),
  };
});
