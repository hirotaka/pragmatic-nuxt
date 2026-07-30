import type { APIResponse } from "@playwright/test";
import { expect } from "@nuxt/test-utils/playwright";

export async function expectCreatedResponse(response: APIResponse) {
  await expectEmptyResponse(response, 201);
}

export async function expectJson(response: APIResponse) {
  expect(response.ok()).toBe(true);
  return response.json();
}

export async function expectEmptyResponse(response: APIResponse, status: number) {
  expect(response.status()).toBe(status);
  expect((await response.body()).byteLength).toBe(0);
}
