export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo({
      path: "/auth/login",
      query: { redirectTo: to.fullPath },
    });
  }
});
