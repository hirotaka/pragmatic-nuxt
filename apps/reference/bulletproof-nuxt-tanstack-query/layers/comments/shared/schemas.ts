import { z } from "zod";

export const createCommentInputSchema = z.object({
  body: z.string().min(1, "Comment body is required"),
  discussionId: z.string().min(1, "Discussion ID is required"),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
