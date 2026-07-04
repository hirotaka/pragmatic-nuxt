import { createTeamRepository } from "~teams/server/repository/teamRepository";

export default defineEventHandler(async (event) => {
  const teamRepository = await createTeamRepository(event);

  return teamRepository.findAll();
});
