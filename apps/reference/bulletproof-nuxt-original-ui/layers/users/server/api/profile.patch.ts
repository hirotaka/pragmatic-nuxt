import { createUserRepository } from "~users/server/repository/userRepository";
import { updateProfileInputSchema } from "~users/shared/schemas";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const sessionUser = session.user as SessionUser;

  const body = await readBody(event);
  const validationResult = updateProfileInputSchema.safeParse(body);

  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: validationResult.error.issues,
    });
  }

  const userRepository = await createUserRepository(event);

  const updatedUser = await userRepository.update(sessionUser.id, {
    email: validationResult.data.email,
    firstName: validationResult.data.firstName,
    lastName: validationResult.data.lastName,
    bio: validationResult.data.bio,
  });

  await setUserSession(event, {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      bio: updatedUser.bio,
      role: updatedUser.role,
      teamId: updatedUser.teamId,
      createdAt: updatedUser.createdAt,
    },
  });

  return {
    data: updatedUser,
  };
});
