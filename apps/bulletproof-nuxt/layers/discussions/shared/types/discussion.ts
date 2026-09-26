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

export type PaginatedDiscussions = PaginatedResult<Discussion>;
