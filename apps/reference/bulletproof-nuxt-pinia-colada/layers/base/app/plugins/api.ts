import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const api = $fetch.create({
    onResponseError({ response }) {
      const data = response._data;
      const message
        = (data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : null)
        ?? response.statusText
        ?? "An unexpected error occurred";

      try {
        nuxtApp.runWithContext(() => {
          const { addNotification } = useNotifications();
          addNotification({
            type: "error",
            title: "Error",
            message,
          });
        });
      }
      catch {
        // Don't let notification failures mask the original API error
      }

      if (response.status === 401) {
        try {
          nuxtApp.runWithContext(() => {
            const currentPath = useRoute().path;
            if (!currentPath.startsWith("/auth/")) {
              navigateTo("/auth/login");
            }
          });
        }
        catch {
          // Don't let redirect failures mask the original API error
        }
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
