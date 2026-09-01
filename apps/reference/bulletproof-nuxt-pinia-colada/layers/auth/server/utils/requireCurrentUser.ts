import { createUserRepository, type User } from "#layers/users/server/repository/userRepository";
import type { SessionIdentity } from "~auth/shared/types";

export const requireCurrentUser = async (event: Parameters<typeof requireUserSession>[0]): Promise<User> => {
  const session = await requireUserSession(event);
  const identity = session.user as Partial<SessionIdentity>;
  if (typeof identity.id !== "string" || identity.id.length === 0) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
  const user = await createUserRepository().findById(identity.id);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  return user;
};
