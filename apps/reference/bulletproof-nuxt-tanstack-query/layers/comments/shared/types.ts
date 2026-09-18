import type { PaginatedResult, PaginationMeta as BasePaginationMeta } from "#layers/base/shared/types/pagination";

export interface Comment {
  id: string;
  body: string;
  discussionId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type PaginationMeta = BasePaginationMeta;
export type PaginatedComments = PaginatedResult<Comment>;

export interface CreateCommentInput {
  body: string;
  discussionId: string;
}
