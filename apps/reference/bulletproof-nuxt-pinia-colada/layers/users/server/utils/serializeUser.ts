import type { User as UserDto, Profile as ProfileDto } from "~users/shared/types";
import type { User as UserRecord } from "~users/server/repository/userRepository";

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

export function serializeProfile(user: UserRecord): ProfileDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
  };
}
