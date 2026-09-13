import { useNotifications } from "#layers/base/app/composables/useNotifications";

const sessionUnavailableNotification = {
  type: "error" as const,
  title: "Session Unavailable",
  message: "The request completed, but the session could not be refreshed. Please try again.",
};

export class UserSessionRefreshError extends Error {
  constructor() {
    super("The user session could not be refreshed.");
    this.name = "UserSessionRefreshError";
  }
}

export function useRequiredUserSessionRefresh() {
  const { fetch, loggedIn } = useUserSession();
  const { addNotification } = useNotifications();
  const throwSessionUnavailable = () => {
    addNotification(sessionUnavailableNotification);
    throw new UserSessionRefreshError();
  };

  return async () => {
    try {
      await fetch();
    }
    catch {
      throwSessionUnavailable();
    }

    if (!loggedIn.value) {
      throwSessionUnavailable();
    }
  };
}
