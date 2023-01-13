import { BaseEntity } from "./base";

export type Comment = {
  body: string;
  authorId: string;
  discussionId: string;
} & BaseEntity;
