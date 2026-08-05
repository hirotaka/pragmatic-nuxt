import { createDiscussionInputSchema } from "~discussions/shared/schemas";
import { createDiscussionRepository } from "~discussions/server/repository/discussionRepository";
import type { User } from "#layers/auth/shared/types";

export default defineEventHandler(async (event) => {
  const sessionUser = (await requireUserSession(event)).user as User;

  if (!sessionUser.teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Team membership required",
    });
  }

  const body = await readBody(event);

  const validationResult = createDiscussionInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid discussion",
    });
  }

  const { title, body: discussionBody } = validationResult.data;

  const discussionRepository = createDiscussionRepository();

  await discussionRepository.create({
    title,
    body: discussionBody,
    authorId: sessionUser.id,
    teamId: sessionUser.teamId,
  });

  setResponseStatus(event, 201);
});
