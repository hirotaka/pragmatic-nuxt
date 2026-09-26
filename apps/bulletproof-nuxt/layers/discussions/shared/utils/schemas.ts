import { z } from "zod";

// Create discussion schema
export const createDiscussionInputSchema = z.object({
  title: z.string().min(1, "Required"),
  body: z.string().min(1, "Required"),
});

export type CreateDiscussionFormState = z.input<
  typeof createDiscussionInputSchema
>;
export type CreateDiscussionInput = z.output<
  typeof createDiscussionInputSchema
>;

// Update discussion schema
export const updateDiscussionInputSchema = z.object({
  title: z.string().min(1, "Required").optional(),
  body: z.string().min(1, "Required").optional(),
});

export type UpdateDiscussionFormState = z.input<
  typeof updateDiscussionInputSchema
>;
export type UpdateDiscussionInput = z.output<
  typeof updateDiscussionInputSchema
>;
