import type { H3Event } from "h3";
import { users } from "~~/db/schema";
import { eq, desc } from "drizzle-orm";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  role: "ADMIN" | "USER";
  teamId: string;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export const createUserRepository = async (event: H3Event) => {
  const db = await useDb(event);

  const findByEmail = async (email: string): Promise<UserWithPassword | null> => {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!result) return null;

    return {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      bio: result.bio ?? undefined,
      role: result.role as "ADMIN" | "USER",
      teamId: result.teamId,
      password: result.password,
      createdAt: result.createdAt,
    };
  };

  const findById = async (id: string): Promise<User | null> => {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!result) return null;

    return {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      bio: result.bio ?? undefined,
      role: result.role as "ADMIN" | "USER",
      teamId: result.teamId,
      createdAt: result.createdAt,
    };
  };

  const findAll = async (teamId: string): Promise<User[]> => {
    const results = await db.query.users.findMany({
      where: eq(users.teamId, teamId),
      orderBy: [desc(users.createdAt)],
    });

    return results.map((user: (typeof results)[number]) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio ?? undefined,
      role: user.role as "ADMIN" | "USER",
      teamId: user.teamId,
      createdAt: user.createdAt,
    }));
  };

  const create = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    teamId: string;
    role?: "ADMIN" | "USER";
  }): Promise<User> => {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        teamId: data.teamId,
        role: data.role || "USER",
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio ?? undefined,
      role: user.role as "ADMIN" | "USER",
      teamId: user.teamId,
      createdAt: user.createdAt,
    };
  };

  const update = async (
    id: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      bio?: string;
    },
  ): Promise<User> => {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error("Failed to update user");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio ?? undefined,
      role: user.role as "ADMIN" | "USER",
      teamId: user.teamId,
      createdAt: user.createdAt,
    };
  };

  const remove = async (id: string): Promise<void> => {
    await db.delete(users).where(eq(users.id, id));
  };

  return {
    findByEmail,
    findById,
    findAll,
    create,
    update,
    delete: remove,
  };
};
