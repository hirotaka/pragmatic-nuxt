import type { Discussion as DiscussionDto } from "~discussions/shared/types";
import type { DiscussionWithAuthor } from "~discussions/server/repository/discussionRepository";

export function serializeDiscussion(discussion: DiscussionWithAuthor): DiscussionDto {
  return {
    id: discussion.id,
    title: discussion.title,
    body: discussion.body,
    authorId: discussion.authorId,
    teamId: discussion.teamId,
    createdAt: discussion.createdAt.toISOString(),
    updatedAt: discussion.updatedAt.toISOString(),
    author: discussion.author,
  };
}
