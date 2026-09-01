const DEFAULT_LOGIN_REDIRECT = "/app";

export function resolveLoginRedirect(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return DEFAULT_LOGIN_REDIRECT;
  }

  try {
    const destination = new URL(value, "http://localhost");

    if (destination.origin !== "http://localhost") {
      return DEFAULT_LOGIN_REDIRECT;
    }

    if (destination.pathname !== "/app" && !destination.pathname.startsWith("/app/")) {
      return DEFAULT_LOGIN_REDIRECT;
    }

    return value;
  }
  catch {
    return DEFAULT_LOGIN_REDIRECT;
  }
}
