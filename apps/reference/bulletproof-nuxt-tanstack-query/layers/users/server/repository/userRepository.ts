import { db } from "@nuxthub/db";
import { users } from "@nuxthub/db/schema";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import type { PaginatedResult } from "#layers/base/shared/types/pagination";

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

export const createUserRepository = () => {
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

  const emailExistsForOtherUser = async (email: string, userId: string): Promise<boolean> => {
    const result = await db.query.users.findFirst({
      columns: { id: true },
      where: and(eq(users.email, email), ne(users.id, userId)),
    });

    return Boolean(result);
  };

  const findAll = async (params: {
    teamId: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResult<User>> => {
    const { teamId, page, limit } = params;
    const offset = (page - 1) * limit;
    const teamFilter = eq(users.teamId, teamId);

    const [results, totalResult] = await Promise.all([
      db.query.users.findMany({
        where: teamFilter,
        orderBy: [desc(users.createdAt)],
        offset,
        limit,
      }),
      db.select({ count: sql<number>`count(*)` }).from(users).where(teamFilter),
    ]);

    const mapUser = (user: typeof users.$inferSelect): User => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio ?? undefined,
      role: user.role as "ADMIN" | "USER",
      teamId: user.teamId,
      createdAt: user.createdAt,
    });
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: results.map(mapUser),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
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

  const remove = async (id: string, teamId: string): Promise<boolean> => {
    const [deleted] = await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.teamId, teamId)))
      .returning({ id: users.id });

    return Boolean(deleted);
  };

  return {
    findByEmail,
    findById,
    emailExistsForOtherUser,
    findAll,
    create,
    update,
    delete: remove,
  };
};
