import { rm } from "node:fs/promises";
import { test as teardown } from "@nuxt/test-utils/playwright";
import { clearE2EDatabase } from "~~/test/e2e/support/database";
import { authenticationDirectory } from "~~/test/e2e/support/authentication";

teardown("clear E2E business data and authentication files", async ({ baseURL }) => {
  try {
    await clearE2EDatabase(baseURL);
  }
  finally {
    await rm(authenticationDirectory, { recursive: true, force: true });
  }
});
