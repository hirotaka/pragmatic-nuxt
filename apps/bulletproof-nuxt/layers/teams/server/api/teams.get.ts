import { createTeamRepository } from "../repository/teamRepository";

export default defineEventHandler(async () => {
  const teamRepository = createTeamRepository();

  const teams = await teamRepository.findAll();

  return teams.map(serializeTeam);
});
