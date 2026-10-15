import { createUserRepository } from "#layers/users/server/repository/userRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
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

  const updated = await userRepository.update(sessionUser.id, {
    email: validationResult.data.email,
    firstName: validationResult.data.firstName,
    lastName: validationResult.data.lastName,
    bio: validationResult.data.bio,
  });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  setResponseStatus(event, 204);
});
