import type { DiscussionWithAuthorRecord } from "#layers/discussions/server/repository/discussionRepository";

export function serializeDiscussion(discussion: DiscussionWithAuthorRecord): Discussion {
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
