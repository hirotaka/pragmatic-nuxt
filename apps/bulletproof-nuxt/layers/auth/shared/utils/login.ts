import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().min(1, "Required").email("Invalid email"),
  password: z.string().min(5, "Required"),
});

export type LoginFormState = z.input<typeof loginInputSchema>;
export type LoginInput = z.output<typeof loginInputSchema>;
