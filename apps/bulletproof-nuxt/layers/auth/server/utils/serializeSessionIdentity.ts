import type { SessionIdentity } from "~auth/shared/types";
import type { User as UserRecord } from "#layers/users/server/repository/userRepository";

export function serializeSessionIdentity(user: UserRecord): SessionIdentity {
  return { id: user.id };
}
