export class UserSessionRefreshError extends Error {
  constructor() {
    super("The user session could not be refreshed.");
    this.name = "UserSessionRefreshError";
  }
}

export function useRequiredUserSessionRefresh() {
  const { fetch, loggedIn } = useUserSession();
  const throwSessionUnavailable = () => {
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
