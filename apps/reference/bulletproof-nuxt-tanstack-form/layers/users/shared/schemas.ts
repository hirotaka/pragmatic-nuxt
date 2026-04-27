import { z } from "zod";

export const updateProfileInputSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
