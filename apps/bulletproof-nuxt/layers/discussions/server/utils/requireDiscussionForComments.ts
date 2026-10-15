import type { H3Event } from "h3";
import { createDiscussionRepository } from "#layers/discussions/server/repository/discussionRepository";

export async function requireDiscussionForComments(
  event: H3Event,
  user: { teamId: string | null | undefined },
): Promise<string> {
  assertDiscussionTeamMember(user);

  const discussionId = getRouterParam(event, "id");
  if (!discussionId) {
    throw createError({ statusCode: 400, statusMessage: "Discussion ID is required" });
  }

  const discussion = await createDiscussionRepository().findByIdAndTeamId(discussionId, user.teamId);
  if (!discussion) {
    throw createError({ statusCode: 404, statusMessage: "Discussion not found" });
  }

  return discussion.id;
}
