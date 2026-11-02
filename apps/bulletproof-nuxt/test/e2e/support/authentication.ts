import type { APIRequestContext } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { expect } from "@nuxt/test-utils/playwright";

export const authenticationDirectory = fileURLToPath(new URL("../.auth/", import.meta.url));

export async function login(
  request: APIRequestContext,
  baseURL: string | undefined,
  credentials: { user: { email: string }; password: string },
) {
  const response = await request.post(new URL("/api/auth/login", baseURL).href, {
    data: { email: credentials.user.email, password: credentials.password },
  });
  expect(response.status()).toBe(204);
  expect((await response.body()).byteLength).toBe(0);
}
