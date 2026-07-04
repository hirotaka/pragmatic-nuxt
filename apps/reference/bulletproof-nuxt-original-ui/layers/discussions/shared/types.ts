export interface Discussion {
  id: string;
  title: string;
  body: string;
  authorId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedDiscussions {
  data: Discussion[];
  meta: PaginationMeta;
}

export interface CreateDiscussionInput {
  title: string;
  body: string;
}

export interface UpdateDiscussionInput {
  title?: string;
  body?: string;
}
