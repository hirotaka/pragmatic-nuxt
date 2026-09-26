import type { UserRecord } from "#layers/users/server/repository/userRepository";

export function serializeSessionIdentity(user: UserRecord): SessionIdentity {
  return { id: user.id };
}
