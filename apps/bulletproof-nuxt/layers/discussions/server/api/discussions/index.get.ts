import { createDiscussionRepository } from "~discussions/server/repository/discussionRepository";
import { serializeDiscussion } from "~discussions/server/utils/serializeDiscussion";
import { parsePagination } from "~base/server/utils/parsePagination";
import type { User } from "#layers/auth/shared/types";

export default defineEventHandler(async (event) => {
  const sessionUser = (await requireUserSession(event)).user as User;

  if (!sessionUser.teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Team membership required",
    });
  }

  const query = getQuery(event);
  const { page, limit } = parsePagination(query);

  const discussionRepository = createDiscussionRepository();

  const discussions = await discussionRepository.findAll({
    teamId: sessionUser.teamId,
    page,
    limit,
  });

  return {
    ...discussions,
    data: discussions.data.map(serializeDiscussion),
  };
});
