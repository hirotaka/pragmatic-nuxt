export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  role: "ADMIN" | "USER";
  teamId: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
}

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
}
