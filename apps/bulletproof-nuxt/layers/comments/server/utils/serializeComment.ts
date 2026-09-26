import type { Comment } from "../../shared/types/comment";
import type { CommentRecord } from "../repository/commentRepository";

export function serializeComment(comment: CommentRecord): Comment {
  return {
    id: comment.id,
    body: comment.body,
    discussionId: comment.discussionId,
    authorId: comment.authorId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
  };
}
