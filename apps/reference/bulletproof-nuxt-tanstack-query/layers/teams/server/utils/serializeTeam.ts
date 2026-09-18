import type { Team as TeamDto } from "#layers/auth/shared/types";
import type { Team as TeamRecord } from "~teams/server/repository/teamRepository";

export function serializeTeam(team: TeamRecord): TeamDto {
  return {
    id: team.id,
    name: team.name,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
  };
}
