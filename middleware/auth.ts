export default defineNuxtRouteMiddleware((_to, _from) => {
  if (isAuthenticated() === false) {
    return navigateTo("/auth/login");
  }
});
