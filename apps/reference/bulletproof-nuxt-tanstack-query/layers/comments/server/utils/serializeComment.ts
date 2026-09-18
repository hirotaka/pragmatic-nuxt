import type { Comment as CommentDto } from "~comments/shared/types";
import type { CommentRecord } from "~comments/server/repository/commentRepository";

export function serializeComment(comment: CommentRecord): CommentDto {
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
