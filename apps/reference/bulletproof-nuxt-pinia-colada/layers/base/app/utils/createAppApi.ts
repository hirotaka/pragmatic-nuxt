export const createAppApi = () => $fetch.create({
  headers: import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined,
  retry: 0,
  onRequest: ({ request }) => {
    // SSR forwards the incoming cookie, so restrict this client to internal API paths.
    if (typeof request !== "string" || !request.startsWith("/api/")) {
      throw new Error("App API transport only accepts internal /api/ paths");
    }
  },
});
