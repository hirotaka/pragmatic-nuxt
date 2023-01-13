import { axios } from "@/utils/axios";

import type { AuthUser } from "@/types";

export const getUser = (): Promise<AuthUser> => {
  return axios.get("/auth/me");
};
