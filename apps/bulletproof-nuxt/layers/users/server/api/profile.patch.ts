import { createUserRepository } from "~users/server/repository/userRepository";
import { updateProfileInputSchema } from "~users/shared/schemas";
import { serializeUser } from "#layers/auth/server/utils/serializeUser";
import type { User } from "#layers/auth/shared/types";

export default defineEventHandler(async (event) => {
  const sessionUser = (await requireUserSession(event)).user as User;

  const body = await readBody(event);
  const validationResult = updateProfileInputSchema.safeParse(body);

  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid profile",
    });
  }

  const userRepository = createUserRepository();

  if (await userRepository.emailExistsForOtherUser(validationResult.data.email, sessionUser.id)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email already in use",
    });
  }

  const updatedUser = await userRepository.update(sessionUser.id, {
    email: validationResult.data.email,
    firstName: validationResult.data.firstName,
    lastName: validationResult.data.lastName,
    bio: validationResult.data.bio,
  });

  const serializedUser = serializeUser(updatedUser);

  await setUserSession(event, { user: serializedUser });

  setResponseStatus(event, 204);
});
