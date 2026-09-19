import { z } from "zod";

// Login schema
export const loginInputSchema = z.object({
  email: z.string().min(1, "Required").email("Invalid email"),
  password: z.string().min(5, "Required"),
});

export type LoginFormState = z.input<typeof loginInputSchema>;
export type LoginInput = z.output<typeof loginInputSchema>;

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

type RegisterSchemaInput = z.input<typeof registerInputSchema>;

export type RegisterFormState = Pick<
  RegisterSchemaInput,
  "email" | "firstName" | "lastName" | "password"
> & {
  teamId: string | null;
  teamName: string | null;
};
export type RegisterInput = z.output<typeof registerInputSchema>;
