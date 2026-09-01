import { updateDiscussionInputSchema } from "~discussions/shared/schemas";
import { createDiscussionRepository } from "~discussions/server/repository/discussionRepository";
import { requireCurrentUser } from "#layers/auth/server/utils/requireCurrentUser";

export default defineEventHandler(async (event) => {
  const sessionUser = await requireCurrentUser(event);

  if (!sessionUser.teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Team membership required",
    });
  }

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Discussion ID is required",
    });
  }

  const discussionRepository = createDiscussionRepository();

  const existingDiscussion = await discussionRepository.findByIdAndTeam(id, sessionUser.teamId);

  if (!existingDiscussion) {
    throw createError({
      statusCode: 404,
      statusMessage: "Discussion not found",
    });
  }

  if (existingDiscussion.authorId !== sessionUser.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Discussion update not allowed",
    });
  }

  const body = await readBody(event);

  const validationResult = updateDiscussionInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid discussion",
    });
  }

  await discussionRepository.update(id, validationResult.data);

  setResponseStatus(event, 204);
});
