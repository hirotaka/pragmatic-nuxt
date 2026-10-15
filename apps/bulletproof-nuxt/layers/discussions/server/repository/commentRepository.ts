import { db } from "@nuxthub/db";
import { comments } from "@nuxthub/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

export type CommentRecord = typeof comments.$inferSelect;

export type CommentWithAuthorRecord = CommentRecord & {
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export const createCommentRepository = () => {
  const findAllByDiscussionId = async (params: {
    discussionId: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResult<CommentWithAuthorRecord>> => {
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
      items: results,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    };
  };

  const findById = async (id: string): Promise<CommentWithAuthorRecord | null> => {
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
  }): Promise<CommentRecord> => {
    const [comment] = await db.insert(comments).values(data).returning();
    if (!comment) {
      throw new Error("Failed to create comment");
    }
    return comment;
  };

  const remove = async (id: string, discussionId: string): Promise<boolean> => {
    const [deleted] = await db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.discussionId, discussionId)))
      .returning({ id: comments.id });

    return Boolean(deleted);
  };

  return {
    findAllByDiscussionId,
    findById,
    create,
    delete: remove,
  };
};
