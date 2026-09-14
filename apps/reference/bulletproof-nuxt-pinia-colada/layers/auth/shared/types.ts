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
