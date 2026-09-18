import { createUserRepository } from "~users/server/repository/userRepository";
import { updateProfileInputSchema } from "~users/shared/schemas";

export default defineProtectedEventHandler(async (event, sessionUser) => {
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

  await userRepository.update(sessionUser.id, {
    email: validationResult.data.email,
    firstName: validationResult.data.firstName,
    lastName: validationResult.data.lastName,
    bio: validationResult.data.bio,
  });

  setResponseStatus(event, 204);
});
