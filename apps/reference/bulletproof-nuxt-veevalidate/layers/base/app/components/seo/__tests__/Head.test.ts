import { expect, test } from "vitest";
import { waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Head from "../Head.vue";

test("should add proper page title and meta description", async () => {
  const title = "Hello World";
  const titleSuffix = " | Bulletproof Nuxt";
  const description = "This is a description";

  await mountSuspended(Head, {
    props: {
      title,
      description,
    },
  });

  // In Nuxt environment, useHead is called automatically
  // We verify by checking the document title (useHead sets it)
  await waitFor(() => {
    expect(document.title).toBe(title + titleSuffix);
    const metaDescription = document.querySelector("meta[name=\"description\"]");
    expect(metaDescription?.getAttribute("content")).toBe(description);
  });
});
