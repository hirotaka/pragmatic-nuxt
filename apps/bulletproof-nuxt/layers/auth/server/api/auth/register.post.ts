import { createUserRepository } from "#layers/users/server/repository/userRepository";
import { createTeamRepository } from "#layers/teams/server/repository/teamRepository";
import { registerInputSchema } from "~auth/shared/schemas";
import { customHashPassword } from "~auth/server/utils/password";
import { serializeUser } from "~auth/server/utils/serializeUser";

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
      statusMessage: "Team selection required",
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

  const serializedUser = serializeUser(user);

  await setUserSession(event, { user: serializedUser });
  setResponseStatus(event, 201);
});
