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
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
}

export interface PaginationMeta {
  page: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface PaginatedComments {
  data: Comment[];
  meta: PaginationMeta;
}

export interface CreateCommentInput {
  body: string;
  discussionId: string;
}
