import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import ProfilePage from "../profile.vue";

const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    id: "user-1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "USER",
    bio: "Existing bio",
    teamId: "team-1",
    createdAt: new Date(),
  },
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    user: mockUser,
  }),
}));

describe("Profile page", () => {
  test("renders user details and update action inside the dashboard page rhythm", async () => {
    const wrapper = await mountSuspended(ProfilePage, {
      global: {
        stubs: {
          UpdateProfile: {
            template: "<button>Update Profile</button>",
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Profile");
    expect(wrapper.text()).toContain("Manage the account details used across this workspace.");
    expect(wrapper.text()).toContain("User Information");
    expect(wrapper.text()).toContain("Test");
    expect(wrapper.text()).toContain("User");
    expect(wrapper.text()).toContain("user@example.com");
    expect(wrapper.text()).toContain("Existing bio");
    expect(wrapper.text()).toContain("Update Profile");
  });
});
