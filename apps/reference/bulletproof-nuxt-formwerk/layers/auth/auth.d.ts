// Extend nuxt-auth-utils types
declare module "#auth-utils" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    bio?: string;
    teamId: string;
    role: "ADMIN" | "USER";
    createdAt: Date;
  }
}

export {};
