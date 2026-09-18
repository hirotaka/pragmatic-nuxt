import type { H3Event } from "h3";
import { createUserRepository } from "#layers/users/server/repository/userRepository";

export async function requireCurrentUser(event: H3Event) {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  if (typeof userId !== "string" || userId.length === 0) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const user = await createUserRepository().findById(userId);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  return user;
}
