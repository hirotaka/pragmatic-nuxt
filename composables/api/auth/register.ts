import { axios } from "@/utils/axios";
import type { UserResponse } from "@/types";

export type RegisterCredentialsDTO = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const registerWithEmailAndPassword = (
  data: RegisterCredentialsDTO
): Promise<UserResponse> => {
  return axios.post("/auth/register", data);
};
