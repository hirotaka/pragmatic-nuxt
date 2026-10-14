export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== "/app" && !to.path.startsWith("/app/")) {
    return;
  }

  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo({
      path: "/auth/login",
      query: { redirectTo: to.fullPath },
    });
  }
});
