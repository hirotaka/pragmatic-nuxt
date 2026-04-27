import { createUserRepository } from "#layers/users/server/repository/userRepository";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const sessionUser = session.user as SessionUser;

  const userRepository = await createUserRepository(event);

  const user = await userRepository.findById(sessionUser.id);

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      teamId: user.teamId,
      createdAt: user.createdAt,
    },
  };
});
