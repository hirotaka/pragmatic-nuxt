import type { H3Event } from "h3";
import type {
  Discussion,
  PaginatedDiscussions,
} from "~discussions/shared/types";
import { discussions, users } from "~~/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const createDiscussionRepository = async (event: H3Event) => {
  const db = await useDb(event);

  const findAll = async (params: {
    teamId: string;
    page: number;
    limit: number;
  }): Promise<PaginatedDiscussions> => {
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
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  const findById = async (id: string): Promise<Discussion | null> => {
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
  ): Promise<Discussion | null> => {
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
  }): Promise<Discussion> => {
    const [discussion] = await db.insert(discussions).values(data).returning();

    if (!discussion) {
      throw new Error("Failed to create discussion");
    }

    const author = await db.query.users.findFirst({
      where: eq(users.id, discussion.authorId),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return {
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      authorId: discussion.authorId,
      teamId: discussion.teamId,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      author: author!,
    };
  };

  const update = async (
    id: string,
    data: {
      title?: string;
      body?: string;
    },
  ): Promise<Discussion> => {
    const [discussion] = await db
      .update(discussions)
      .set(data)
      .where(eq(discussions.id, id))
      .returning();

    if (!discussion) {
      throw new Error("Failed to update discussion");
    }

    const author = await db.query.users.findFirst({
      where: eq(users.id, discussion.authorId),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return {
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      authorId: discussion.authorId,
      teamId: discussion.teamId,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      author: author!,
    };
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
