import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { loginInputSchema } from "~auth/shared/schemas";
import { customVerifyPassword } from "~auth/server/utils/password";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validationResult = loginInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: validationResult.error.issues,
    });
  }

  const { email, password } = validationResult.data;

  const userRepository = await createUserRepository(event);

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid username or password",
    });
  }

  const isPasswordValid = await customVerifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid username or password",
    });
  }

  await setUserSession(event, {
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
  });

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
