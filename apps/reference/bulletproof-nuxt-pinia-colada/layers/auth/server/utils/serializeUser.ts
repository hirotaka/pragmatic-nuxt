import type { SessionIdentity, User } from "~auth/shared/types";
import type { User as UserRecord } from "#layers/users/server/repository/userRepository";

export function serializeSessionIdentity(user: UserRecord): SessionIdentity {
  return { id: user.id };
}

export function serializeSessionUser(user: UserRecord): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    role: user.role,
    teamId: user.teamId,
    createdAt: user.createdAt.toISOString(),
  };
}
