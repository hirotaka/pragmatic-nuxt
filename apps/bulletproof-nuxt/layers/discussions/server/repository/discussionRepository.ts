import { db } from "@nuxthub/db";
import { discussions } from "@nuxthub/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export type DiscussionRecord = typeof discussions.$inferSelect;

export type DiscussionWithAuthorRecord = DiscussionRecord & {
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export const createDiscussionRepository = () => {
  const findAllByTeamId = async (params: {
    teamId: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResult<DiscussionWithAuthorRecord>> => {
    const { teamId, page, limit } = params;
    const offset = (page - 1) * limit;

    const results = await db.query.discussions.findMany({
      where: eq(discussions.teamId, teamId),
      with: {
        author: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(discussions.createdAt)],
      offset,
      limit,
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(discussions)
      .where(eq(discussions.teamId, teamId));

    const total = totalResult[0]?.count ?? 0;

    const totalPages = Math.ceil(total / limit);

    return {
      items: results.map((discussion: typeof results[number]) => ({
        id: discussion.id,
        title: discussion.title,
        body: discussion.body,
        authorId: discussion.authorId,
        teamId: discussion.teamId,
        createdAt: discussion.createdAt,
        updatedAt: discussion.updatedAt,
        author: discussion.author,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  };

  const findById = async (id: string): Promise<DiscussionWithAuthorRecord | null> => {
    const result = await db.query.discussions.findFirst({
      where: eq(discussions.id, id),
      with: {
        author: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      body: result.body,
      authorId: result.authorId,
      teamId: result.teamId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      author: result.author,
    };
  };

  const findByIdAndTeamId = async (
    id: string,
    teamId: string,
  ): Promise<DiscussionWithAuthorRecord | null> => {
    const result = await db.query.discussions.findFirst({
      where: and(eq(discussions.id, id), eq(discussions.teamId, teamId)),
      with: {
        author: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      body: result.body,
      authorId: result.authorId,
      teamId: result.teamId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      author: result.author,
    };
  };

  const create = async (data: {
    title: string;
    body: string;
    authorId: string;
    teamId: string;
  }): Promise<DiscussionRecord> => {
    const [discussion] = await db.insert(discussions).values(data).returning();
    if (!discussion) {
      throw new Error("Failed to create discussion");
    }
    return discussion;
  };

  const update = async (
    id: string,
    teamId: string,
    data: {
      title?: string;
      body?: string;
    },
  ): Promise<boolean> => {
    const [updated] = await db
      .update(discussions)
      .set(data)
      .where(and(eq(discussions.id, id), eq(discussions.teamId, teamId)))
      .returning({ id: discussions.id });

    return Boolean(updated);
  };

  const remove = async (id: string, teamId: string): Promise<boolean> => {
    const [deleted] = await db
      .delete(discussions)
      .where(and(eq(discussions.id, id), eq(discussions.teamId, teamId)))
      .returning({ id: discussions.id });

    return Boolean(deleted);
  };

  return {
    findAllByTeamId,
    findById,
    findByIdAndTeamId,
    create,
    update,
    delete: remove,
  };
};
