import { expect, test } from "vitest";
import { ref } from "vue";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { within } from "@testing-library/vue";
import Authorization from "../Authorization.vue";
import { ROLES } from "#layers/auth/app/composables/useAuthorization";
import { createUser } from "~~/test/data-generators";
import type { User } from "#layers/auth/shared/types";

// Mock useUser composable using @nuxt/test-utils
const mockUserRef = ref<User | null>(null);

mockNuxtImport("useUser", () => {
  return () => ({
    user: mockUserRef,
  });
});

test("should view protected resource if user role is matching", async () => {
  const user = createUser({
    role: ROLES.ADMIN,
  }) as unknown as User;

  mockUserRef.value = user;

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
  const user = createUser({
    role: ROLES.USER,
  }) as unknown as User;

  mockUserRef.value = user;

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
  const user = createUser({
    role: ROLES.ADMIN,
  }) as unknown as User;

  mockUserRef.value = user;

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
  const user = createUser({
    role: ROLES.USER,
  }) as unknown as User;

  mockUserRef.value = user;

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
