import type { PaginatedResult } from "#layers/base/shared/types/pagination";
import type { User } from "#layers/auth/shared/types";

export type { User } from "#layers/auth/shared/types";

export type PaginatedUsers = PaginatedResult<User>;
