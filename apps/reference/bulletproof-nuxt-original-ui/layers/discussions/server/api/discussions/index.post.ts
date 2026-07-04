import { createDiscussionInputSchema } from "~discussions/shared/schemas";
import { createDiscussionRepository } from "~discussions/server/repository/discussionRepository";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const sessionUser = session.user as SessionUser;

  if (!sessionUser.teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User must belong to a team",
    });
  }

  const body = await readBody(event);

  const validationResult = createDiscussionInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: validationResult.error.issues,
    });
  }

  const { title, body: discussionBody } = validationResult.data;

  const discussionRepository = await createDiscussionRepository(event);

  const discussion = await discussionRepository.create({
    title,
    body: discussionBody,
    authorId: sessionUser.id,
    teamId: sessionUser.teamId,
  });

  setResponseStatus(event, 201);
  return { discussion };
});
