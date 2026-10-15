import type { Comment } from "#layers/discussions/shared/types/comment";
import type { CommentWithAuthorRecord } from "#layers/discussions/server/repository/commentRepository";

export function serializeComment(comment: CommentWithAuthorRecord): Comment {
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
