import { z } from "zod";

// Create discussion schema
export const createDiscussionInputSchema = z.object({
  title: z.string().min(1, "Required"),
  body: z.string().min(1, "Required"),
});

export type CreateDiscussionInput = z.infer<
  typeof createDiscussionInputSchema
>;

// Update discussion schema
export const updateDiscussionInputSchema = z.object({
  title: z.string().min(1, "Required").optional(),
  body: z.string().min(1, "Required").optional(),
});

export type UpdateDiscussionInput = z.infer<
  typeof updateDiscussionInputSchema
>;
