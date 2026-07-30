import { createTeamRepository } from "~teams/server/repository/teamRepository";
import { serializeTeam } from "~teams/server/utils/serializeTeam";

export default defineEventHandler(async (event) => {
  const teamRepository = await createTeamRepository(event);

  const teams = await teamRepository.findAll();

  return teams.map(serializeTeam);
});
