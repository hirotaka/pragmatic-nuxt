import type { BaseEntity } from "./base";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "USER";
  teamId: string;
  bio: string;
} & BaseEntity;
