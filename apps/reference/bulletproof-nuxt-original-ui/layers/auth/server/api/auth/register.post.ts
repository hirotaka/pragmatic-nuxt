import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { createTeamRepository } from "#layers/teams/server/repository/teamRepository";
import { registerInputSchema } from "~auth/shared/schemas";
import { customHashPassword } from "~auth/server/utils/password";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validationResult = registerInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: validationResult.error.issues,
    });
  }

  const data = validationResult.data;

  const userRepository = await createUserRepository(event);
  const teamRepository = await createTeamRepository(event);

  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "User with this email already exists",
    });
  }

  let teamId: string;
  let role: "ADMIN" | "USER" = "USER";

  if (data.teamId) {
    const team = await teamRepository.findById(data.teamId);
    if (!team) {
      throw createError({
        statusCode: 400,
        statusMessage: "Team not found",
      });
    }
    teamId = data.teamId;
    role = "USER";
  }
  else if (data.teamName) {
    const newTeam = await teamRepository.create(data.teamName);
    teamId = newTeam.id;
    role = "ADMIN";
  }
  else {
    throw createError({
      statusCode: 400,
      statusMessage: "Either teamId or teamName must be provided",
    });
  }

  const hashedPassword = await customHashPassword(data.password);

  const user = await userRepository.create({
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    password: hashedPassword,
    teamId,
    role,
  });

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      teamId: user.teamId,
      createdAt: user.createdAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      teamId: user.teamId,
      createdAt: user.createdAt,
    },
  };
});
