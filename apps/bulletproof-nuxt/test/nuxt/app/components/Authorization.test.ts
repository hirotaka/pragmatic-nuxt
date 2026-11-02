import { expect, test } from "vitest";
import { ref } from "vue";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { within } from "@testing-library/vue";
import Authorization from "~~/app/components/Authorization.vue";
import { ROLES } from "~~/app/composables/useAuthorization";
import type { User } from "#layers/users/shared/types/user";

const user: User = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  role: ROLES.USER,
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

// Mock useCurrentUser composable using @nuxt/test-utils
const mockUserRef = ref<User | null>(null);

mockNuxtImport("useCurrentUser", () => {
  return () => ({
    user: mockUserRef,
  });
});

test("should view protected resource if user role is matching", async () => {
  mockUserRef.value = { ...user, role: ROLES.ADMIN };

  const protectedResource = "This is very confidential data";

  const wrapper = await mountSuspended(Authorization, {
    props: {
      allowedRoles: [ROLES.ADMIN],
    },
    slots: {
      default: () => protectedResource,
    },
  });

  const { getByText } = within(wrapper.element as HTMLElement);
  expect(getByText(protectedResource)).toBeTruthy();
});

test("should not view protected resource if user role does not match and show fallback message instead", async () => {
  mockUserRef.value = { ...user, role: ROLES.USER };

  const protectedResource = "This is very confidential data";

  const forbiddenMessage = "You are unauthorized to view this resource";
  const wrapper = await mountSuspended(Authorization, {
    props: {
      allowedRoles: [ROLES.ADMIN],
    },
    slots: {
      "default": () => protectedResource,
      "forbidden-fallback": () => forbiddenMessage,
    },
  });

  const { queryByText, getByText } = within(wrapper.element as HTMLElement);
  expect(queryByText(protectedResource)).toBeFalsy();
  expect(getByText(forbiddenMessage)).toBeTruthy();
});

test("should view protected resource if policy check passes", async () => {
  mockUserRef.value = { ...user, role: ROLES.ADMIN };

  const protectedResource = "This is very confidential data";

  const wrapper = await mountSuspended(Authorization, {
    props: {
      policyCheck: true,
    },
    slots: {
      default: () => protectedResource,
    },
  });

  const { getByText } = within(wrapper.element as HTMLElement);
  expect(getByText(protectedResource)).toBeTruthy();
});

test("should not view protected resource if policy check fails and show fallback message instead", async () => {
  mockUserRef.value = { ...user, role: ROLES.USER };

  const protectedResource = "This is very confidential data";

  const forbiddenMessage = "You are unauthorized to view this resource";
  const wrapper = await mountSuspended(Authorization, {
    props: {
      policyCheck: false,
    },
    slots: {
      "default": () => protectedResource,
      "forbidden-fallback": () => forbiddenMessage,
    },
  });

  const { queryByText, getByText } = within(wrapper.element as HTMLElement);
  expect(queryByText(protectedResource)).toBeFalsy();
  expect(getByText(forbiddenMessage)).toBeTruthy();
});
