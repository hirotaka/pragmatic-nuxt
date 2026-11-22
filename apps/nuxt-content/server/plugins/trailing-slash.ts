export default defineNitroPlugin((nitroApp) => {
  // Prerendered HTML is served before server middleware, so normalize at request time.
  nitroApp.hooks.hook("request", (event) => {
    const { pathname, search } = getRequestURL(event);
    if (pathname === "/"
      || !pathname.endsWith("/")
      || pathname === "/api"
      || pathname.startsWith("/api/")
      || pathname.startsWith("/_")
      || pathname.includes(".")
      || getRouteRules(event).redirect) {
      return;
    }

    const { headers } = getRouteRules(event);
    if (headers) setHeaders(event, headers);

    return sendRedirect(event, `/${pathname.replace(/^\/+|\/+$/g, "")}${search}`, 308);
  });
});
