import type { User } from "#layers/auth/shared/types";

export interface UsersResponse {
  data: User[];
}

export interface UserResponse {
  data: User;
}

export interface DeleteUserResponse {
  message: string;
}
