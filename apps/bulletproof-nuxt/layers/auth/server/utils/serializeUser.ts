import type { User as UserDto } from "~auth/shared/types";
import type { User as UserRecord } from "#layers/users/server/repository/userRepository";

export function serializeUser(user: UserRecord): UserDto {
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
