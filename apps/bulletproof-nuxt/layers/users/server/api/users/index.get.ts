import { createUserRepository } from "#layers/users/server/repository/userRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
  assertAdmin(sessionUser);

  const userRepository = createUserRepository();

  const users = await userRepository.findAllByTeamId(sessionUser.teamId as string);

  return users.map(serializeUser);
});
