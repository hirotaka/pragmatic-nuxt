import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { createTeamRepository } from "#layers/teams/server/repository/teamRepository";
import { registerInputSchema } from "~auth/shared/schemas";
import { serializeSessionIdentity } from "~auth/server/utils/serializeSessionIdentity";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validationResult = registerInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid registration",
    });
  }

  const data = validationResult.data;

  const userRepository = createUserRepository();
  const teamRepository = createTeamRepository();

  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email already registered",
    });
  }

  let teamId: string;
  let role: "ADMIN" | "USER" = "USER";

  if (data.teamId) {
    const team = await teamRepository.findById(data.teamId);
    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: "Team not found",
      });
    }
    teamId = data.teamId;
  }
  else if (data.teamName) {
    const newTeam = await teamRepository.create(data.teamName);
    teamId = newTeam.id;
    role = "ADMIN";
  }
  else {
    throw createError({
      statusCode: 400,
      statusMessage: "Team selection required",
    });
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.create({
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    password: hashedPassword,
    teamId,
    role,
  });

  await replaceUserSession(event, { user: serializeSessionIdentity(user) });
  setResponseStatus(event, 201);
});
