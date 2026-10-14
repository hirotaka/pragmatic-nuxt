import type { H3Event } from "h3";

export interface AuthApplicationPort {
  findCredentials(email: string): Promise<{ id: string; passwordHash: string } | null>;
}

export function getAuthApplication(event: H3Event): AuthApplicationPort {
  const port = (event.context as Record<string, unknown>).authApplication;
  if (!port || typeof port !== "object") {
    throw createError({ statusCode: 500, statusMessage: "Authentication is unavailable" });
  }

  return port as AuthApplicationPort;
}
