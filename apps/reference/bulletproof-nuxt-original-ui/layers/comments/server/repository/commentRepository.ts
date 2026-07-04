import type { H3Event } from "h3";
import type { Comment, PaginatedComments } from "~comments/shared/types";
import { comments, users } from "~~/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const createCommentRepository = async (event: H3Event) => {
  const db = await useDb(event);

  const findByDiscussionId = async (params: {
    discussionId: string;
    page: number;
    limit: number;
  }): Promise<PaginatedComments> => {
    const { discussionId, page, limit } = params;
    const offset = (page - 1) * limit;

    const results = await db.query.comments.findMany({
      where: eq(comments.discussionId, discussionId),
      with: {
        author: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(comments.createdAt)],
      offset,
      limit,
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.discussionId, discussionId));

    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data: results,
      meta: {
        page,
        total,
        totalPages,
        hasMore,
      },
    };
  };

  const findById = async (id: string): Promise<Comment | null> => {
    const result = await db.query.comments.findFirst({
      where: eq(comments.id, id),
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

    return result ?? null;
  };

  const create = async (data: {
    body: string;
    discussionId: string;
    authorId: string;
  }): Promise<Comment> => {
    const [comment] = await db
      .insert(comments)
      .values({
        body: data.body,
        discussionId: data.discussionId,
        authorId: data.authorId,
      })
      .returning();

    if (!comment) {
      throw new Error("Failed to create comment");
    }

    const author = await db.query.users.findFirst({
      where: eq(users.id, comment.authorId),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return {
      ...comment,
      author: author!,
    };
  };

  const remove = async (id: string): Promise<void> => {
    await db.delete(comments).where(eq(comments.id, id));
  };

  return {
    findByDiscussionId,
    findById,
    create,
    delete: remove,
  };
};
