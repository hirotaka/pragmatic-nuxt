import { createDiscussionRepository } from "#layers/discussions/server/repository/discussionRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
  assertDiscussionTeamMember(sessionUser);

  const query = getQuery(event);
  const { page, limit } = parsePagination(query);

  const discussionRepository = createDiscussionRepository();

  const discussions = await discussionRepository.findAllByTeamId({
    teamId: sessionUser.teamId,
    page,
    limit,
  });

  return {
    ...discussions,
    items: discussions.items.map(serializeDiscussion),
  };
});
