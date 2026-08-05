import type { PaginatedResult, PaginationMeta as BasePaginationMeta } from "#layers/base/shared/types/pagination";

export interface Discussion {
  id: string;
  title: string;
  body: string;
  authorId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export type PaginationMeta = BasePaginationMeta;
export type PaginatedDiscussions = PaginatedResult<Discussion>;

export interface CreateDiscussionInput {
  title: string;
  body: string;
}

export interface UpdateDiscussionInput {
  title?: string;
  body?: string;
}
