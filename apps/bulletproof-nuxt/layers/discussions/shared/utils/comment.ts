import { z } from "zod";

export const createCommentInputSchema = z.object({
  body: z.string().min(1, "Comment body is required"),
});

export type CreateCommentFormState = z.input<typeof createCommentInputSchema>;
export type CreateCommentInput = z.output<typeof createCommentInputSchema>;
