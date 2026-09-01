import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { loginInputSchema } from "~auth/shared/schemas";
import { customVerifyPassword } from "~auth/server/utils/password";
import { serializeSessionIdentity } from "~auth/server/utils/serializeUser";
import type { User } from "~auth/shared/types";

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

  const isPasswordValid = await customVerifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  const sessionUser = serializeSessionIdentity(user);

  await replaceUserSession(event, { user: sessionUser as unknown as User });
  setResponseStatus(event, 204);
});
