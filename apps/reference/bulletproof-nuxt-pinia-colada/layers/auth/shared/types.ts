export interface SessionIdentity {
  id: string;
}

export interface User extends SessionIdentity {
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  role: "ADMIN" | "USER";
  teamId: string;
  createdAt: string;
}

/** Compatibility name for server authorization consumers during the session migration. */
export type SessionUser = User;
