import { beforeEach, expect, test, vi } from "vitest";
import {
  assertAdmin,
  assertCommentDelete,
  assertDiscussionAuthor,
  assertDiscussionTeamMember,
  assertNotSelfDelete,
  isAdmin,
} from "../authorization";

const { createError } = vi.hoisted(() => ({
  createError: vi.fn((input: { statusCode: number; statusMessage: string }) => Object.assign(new Error(input.statusMessage), input)),
}));

beforeEach(() => {
  createError.mockClear();
  vi.stubGlobal("createError", createError);
});

test("centralizes administrator and team membership decisions", () => {
  expect(isAdmin({ role: "ADMIN" })).toBe(true);
  expect(isAdmin({ role: "USER" })).toBe(false);
  expect(() => assertAdmin({ role: "USER" })).toThrow(expect.objectContaining({
    statusCode: 403,
    statusMessage: "Admin access required",
  }));
  expect(() => assertDiscussionTeamMember({ teamId: null })).toThrow(expect.objectContaining({
    statusCode: 400,
    statusMessage: "Team membership required",
  }));
  expect(() => assertDiscussionTeamMember({ teamId: "team-1" })).not.toThrow();
});

test("preserves discussion author-only update and delete decisions", () => {
  const user = { id: "user-1" };
  expect(() => assertDiscussionAuthor(user, { authorId: user.id }, "update")).not.toThrow();
  expect(() => assertDiscussionAuthor(user, { authorId: "user-2" }, "update")).toThrow(expect.objectContaining({
    statusCode: 403,
    statusMessage: "Discussion update not allowed",
  }));
  expect(() => assertDiscussionAuthor(user, { authorId: "user-2" }, "delete")).toThrow(expect.objectContaining({
    statusCode: 403,
    statusMessage: "Discussion delete not allowed",
  }));
});

test("preserves comment and user deletion authorization decisions", () => {
  expect(() => assertCommentDelete({ id: "user-1", role: "USER" }, { authorId: "user-1" })).not.toThrow();
  expect(() => assertCommentDelete({ id: "admin", role: "ADMIN" }, { authorId: "user-1" })).not.toThrow();
  expect(() => assertCommentDelete({ id: "user-2", role: "USER" }, { authorId: "user-1" })).toThrow(expect.objectContaining({
    statusCode: 403,
    statusMessage: "Comment delete not allowed",
  }));
  expect(() => assertNotSelfDelete({ id: "user-1" }, "user-1")).toThrow(expect.objectContaining({
    statusCode: 409,
    statusMessage: "Cannot delete your own account",
  }));
});
