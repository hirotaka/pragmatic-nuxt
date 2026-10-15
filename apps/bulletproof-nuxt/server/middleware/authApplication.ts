import { createUserRepository } from "#layers/users/server/repository/userRepository";
import type { AuthApplicationPort } from "#layers/auth/server/utils/authApplication";

declare module "h3" {
  interface H3EventContext {
    authApplication?: AuthApplicationPort;
  }
}

export default defineEventHandler((event) => {
  event.context.authApplication = {
    async findCredentials(email) {
      const user = await createUserRepository().findByEmail(email);
      return user ? { id: user.id, passwordHash: user.password } : null;
    },
  };
});
