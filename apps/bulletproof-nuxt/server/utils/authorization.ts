import type { User } from "#layers/users/shared/types/user";

export function isAdmin(user: Pick<User, "role">): boolean {
  return user.role === "ADMIN";
}

export function assertAdmin(user: Pick<User, "role">): void {
  if (!isAdmin(user)) {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }
}

export function assertDiscussionTeamMember(user: { teamId: string | null | undefined }): asserts user is { teamId: string } {
  if (!user.teamId) {
    throw createError({ statusCode: 400, statusMessage: "Team membership required" });
  }
}

export function assertDiscussionAuthor(user: Pick<User, "id">, discussion: { authorId: string }, action: "update" | "delete"): void {
  if (discussion.authorId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: `Discussion ${action} not allowed` });
  }
}

export function assertCommentDelete(user: Pick<User, "id" | "role">, comment: { authorId: string }): void {
  if (comment.authorId !== user.id && !isAdmin(user)) {
    throw createError({ statusCode: 403, statusMessage: "Comment delete not allowed" });
  }
}

export function assertNotSelfDelete(user: Pick<User, "id">, targetId: string): void {
  if (targetId === user.id) {
    throw createError({ statusCode: 409, statusMessage: "Cannot delete your own account" });
  }
}
