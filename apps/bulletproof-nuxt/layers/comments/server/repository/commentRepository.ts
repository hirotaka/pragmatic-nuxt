import { db } from "@nuxthub/db";
import { comments } from "@nuxthub/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { PaginatedResult } from "#layers/base/shared/types/pagination";

export interface CommentRecord {
  id: string;
  body: string;
  discussionId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export type PaginatedCommentRecords = PaginatedResult<CommentRecord>;

export const createCommentRepository = () => {
  const findByDiscussionId = async (params: {
    discussionId: string;
    page: number;
    limit: number;
  }): Promise<PaginatedCommentRecords> => {
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
        limit,
        total,
        totalPages,
        hasMore,
      },
    };
  };

  const findById = async (id: string): Promise<CommentRecord | null> => {
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
  }): Promise<void> => {
    await db
      .insert(comments)
      .values({
        body: data.body,
        discussionId: data.discussionId,
        authorId: data.authorId,
      });
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
