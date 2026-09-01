export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  role: "ADMIN" | "USER";
  teamId: string;
  createdAt: string;
}

export type Profile = Pick<User, "id" | "email" | "firstName" | "lastName" | "bio" | "createdAt">;
