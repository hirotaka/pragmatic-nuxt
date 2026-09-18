import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { loginInputSchema } from "~auth/shared/schemas";
import { serializeSessionIdentity } from "~auth/server/utils/serializeSessionIdentity";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validationResult = loginInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid login",
    });
  }

  const { email, password } = validationResult.data;

  const userRepository = createUserRepository();

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  let isPasswordValid = false;
  try {
    isPasswordValid = await verifyPassword(user.password, password);
  }
  catch {
    // Stored hashes that the configured provider cannot verify are invalid credentials.
  }
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  await replaceUserSession(event, { user: serializeSessionIdentity(user) });
  setResponseStatus(event, 204);
});
