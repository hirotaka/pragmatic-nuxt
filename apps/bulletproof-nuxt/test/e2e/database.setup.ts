import { test as setup } from "@nuxt/test-utils/playwright";
import { prepareE2EDatabase } from "~~/test/e2e/support/database";

setup("prepare the dedicated E2E database", async ({ baseURL }) => {
  await prepareE2EDatabase(baseURL);
});
