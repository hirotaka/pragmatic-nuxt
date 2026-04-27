import { z } from "zod";

// Login schema
export const loginInputSchema = z.object({
  email: z.string().min(1, "Required").email("Invalid email"),
  password: z.string().min(5, "Required"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Register schema (discriminated union: teamId XOR teamName)
export const registerInputSchema = z
  .object({
    email: z.string().min(1, "Required").email("Invalid email"),
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    password: z.string().min(5, "Required"),
  })
  .and(
    z
      .object({
        teamId: z.string().min(1, "Required"),
        teamName: z.null().default(null),
      })
      .or(
        z.object({
          teamName: z.string().min(1, "Required"),
          teamId: z.null().default(null),
        }),
      ),
  );

export type RegisterInput = z.infer<typeof registerInputSchema>;
