import { toast } from "vue-sonner";

const sessionUnavailableNotification = {
  title: "Session Unavailable",
  description: "The request completed, but the session could not be refreshed. Please try again.",
};

export class UserSessionRefreshError extends Error {
  constructor() {
    super("The user session could not be refreshed.");
    this.name = "UserSessionRefreshError";
  }
}

export function useRequiredUserSessionRefresh() {
  const { fetch, loggedIn } = useUserSession();
  const throwSessionUnavailable = () => {
    toast.error(sessionUnavailableNotification.title, {
      description: sessionUnavailableNotification.description,
    });
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
