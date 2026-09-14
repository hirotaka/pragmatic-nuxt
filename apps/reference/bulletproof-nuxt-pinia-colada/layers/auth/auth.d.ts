// Extend nuxt-auth-utils types
// Session cookies retain only the persistent identity; the fetch hook projects public User data.
declare module "#auth-utils" {
  interface User {
    id: string;
  }
}

export {};
