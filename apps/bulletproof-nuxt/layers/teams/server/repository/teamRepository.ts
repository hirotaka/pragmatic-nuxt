import { db } from "@nuxthub/db";
import { teams } from "@nuxthub/db/schema";
import { eq, desc } from "drizzle-orm";

export interface TeamRecord {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createTeamRepository = () => {
  const create = async (name: string): Promise<TeamRecord> => {
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

  const findById = async (id: string): Promise<TeamRecord | null> => {
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

  const findAll = async (): Promise<TeamRecord[]> => {
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
