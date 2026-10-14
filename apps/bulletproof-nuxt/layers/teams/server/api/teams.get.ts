import { createTeamRepository } from "#layers/teams/server/repository/teamRepository";

export default defineEventHandler(async () => {
  const teamRepository = createTeamRepository();

  const teams = await teamRepository.findAll();

  return teams.map(serializeTeam);
});
