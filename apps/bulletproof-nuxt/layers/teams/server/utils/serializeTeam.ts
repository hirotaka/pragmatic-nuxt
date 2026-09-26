import type { TeamRecord } from "../repository/teamRepository";

export function serializeTeam(team: TeamRecord): Team {
  return {
    id: team.id,
    name: team.name,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
  };
}
