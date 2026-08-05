import { db } from "@nuxthub/db";
import { discussions } from "@nuxthub/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { PaginatedResult } from "#layers/base/shared/types/pagination";

export type DiscussionWithAuthor = Pick<
  typeof discussions.$inferSelect,
  "id" | "title" | "body" | "authorId" | "teamId" | "createdAt" | "updatedAt"
> & {
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export const createDiscussionRepository = () => {
  const findAll = async (params: {
    teamId: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResult<DiscussionWithAuthor>> => {
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
      data: results.map((discussion: typeof results[number]) => ({
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

  const findById = async (id: string): Promise<DiscussionWithAuthor | null> => {
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

  const findByIdAndTeam = async (
    id: string,
    teamId: string,
  ): Promise<DiscussionWithAuthor | null> => {
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
  }): Promise<void> => {
    await db.insert(discussions).values(data);
  };

  const update = async (
    id: string,
    data: {
      title?: string;
      body?: string;
    },
  ): Promise<void> => {
    const [discussion] = await db
      .update(discussions)
      .set(data)
      .where(eq(discussions.id, id))
      .returning({ id: discussions.id });

    if (!discussion) {
      throw new Error("Failed to update discussion");
    }
  };

  const remove = async (id: string): Promise<void> => {
    await db.delete(discussions).where(eq(discussions.id, id));
  };

  return {
    findAll,
    findById,
    findByIdAndTeam,
    create,
    update,
    delete: remove,
  };
};
