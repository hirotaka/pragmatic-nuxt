import type { H3Event } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { assertDiscussionTeamMember } from "~~/server/utils/authorization";
import { requireDiscussionForComments } from "#layers/discussions/server/utils/requireDiscussionForComments";

const { findByIdAndTeamId } = vi.hoisted(() => ({
  findByIdAndTeamId: vi.fn(),
}));

vi.mock("#layers/discussions/server/repository/discussionRepository", () => ({
  createDiscussionRepository: () => ({ findByIdAndTeamId }),
}));

beforeEach(() => {
  findByIdAndTeamId.mockReset().mockResolvedValue({ id: "discussion-1" });
  vi.stubGlobal("assertDiscussionTeamMember", assertDiscussionTeamMember);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const event = { context: { params: { id: "discussion-1" } } } as unknown as H3Event;

test("returns the discussion ID after looking it up within the user's team", async () => {
  await expect(requireDiscussionForComments(event, { teamId: "team-1" })).resolves.toBe("discussion-1");
  expect(findByIdAndTeamId).toHaveBeenCalledExactlyOnceWith("discussion-1", "team-1");
});

test.each([undefined, null, ""])("rejects a user without team membership: %j", async (teamId) => {
  const unreadableParamsEvent = {
    context: {
      get params() {
        throw new Error("Route parameters must not be read without team membership");
      },
    },
  } as unknown as H3Event;

  await expect(requireDiscussionForComments(unreadableParamsEvent, { teamId })).rejects.toMatchObject({
    statusCode: 400,
    statusMessage: "Team membership required",
  });
  expect(findByIdAndTeamId).not.toHaveBeenCalled();
});

test("rejects a missing route ID before querying the repository", async () => {
  const missingIdEvent = { context: { params: {} } } as H3Event;

  await expect(requireDiscussionForComments(missingIdEvent, { teamId: "team-1" })).rejects.toMatchObject({
    statusCode: 400,
    statusMessage: "Discussion ID is required",
  });
  expect(findByIdAndTeamId).not.toHaveBeenCalled();
});

test("rejects a discussion not found within the current team", async () => {
  findByIdAndTeamId.mockResolvedValue(null);

  await expect(requireDiscussionForComments(event, { teamId: "team-1" })).rejects.toMatchObject({
    statusCode: 404,
    statusMessage: "Discussion not found",
  });
});

test("propagates a repository failure without returning a discussion ID", async () => {
  const error = new Error("Database unavailable");
  findByIdAndTeamId.mockRejectedValue(error);

  await expect(requireDiscussionForComments(event, { teamId: "team-1" })).rejects.toBe(error);
});
