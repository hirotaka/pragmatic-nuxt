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

export type PaginatedComments = PaginatedResult<Comment>;
