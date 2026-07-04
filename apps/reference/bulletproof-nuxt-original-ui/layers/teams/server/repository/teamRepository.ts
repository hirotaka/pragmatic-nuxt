import type { H3Event } from "h3";
import { teams } from "~~/db/schema";
import { eq, desc } from "drizzle-orm";

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createTeamRepository = async (event: H3Event) => {
  const db = await useDb(event);

  const create = async (name: string): Promise<Team> => {
    const [team] = await db
      .insert(teams)
      .values({ name })
      .returning();

    if (!team) {
      throw new Error("Failed to create team");
    }

    return {
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  };

  const findById = async (id: string): Promise<Team | null> => {
    const result = await db.query.teams.findFirst({
      where: eq(teams.id, id),
    });

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  };

  const findAll = async (): Promise<Team[]> => {
    const results = await db.query.teams.findMany({
      orderBy: [desc(teams.createdAt)],
    });

    return results.map((team: (typeof results)[number]) => ({
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }));
  };

  return {
    create,
    findById,
    findAll,
  };
};
