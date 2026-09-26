import type { UserRecord } from "#layers/users/server/repository/userRepository";
import type { User } from "#layers/users/shared/types/user";

export function serializeUser(user: UserRecord): User {
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
