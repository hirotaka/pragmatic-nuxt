export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validationResult = loginInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid login" });
  }

  const { email, password } = validationResult.data;
  const account = await getAuthApplication(event).findCredentials(email);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  }

  let isPasswordValid = false;
  try {
    isPasswordValid = await verifyPassword(account.passwordHash, password);
  }
  catch {
    // Stored hashes that the configured provider cannot verify are invalid credentials.
  }
  if (!isPasswordValid) {
    throw createError({ statusCode: 401, statusMessage: "Invalid email or password" });
  }

  await replaceUserSession(event, { user: { id: account.id } });
  setResponseStatus(event, 204);
});
