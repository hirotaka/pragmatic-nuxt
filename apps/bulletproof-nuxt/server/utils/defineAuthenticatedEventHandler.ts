import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import type { AuthenticatedPrincipal } from "#server/types/authenticated-principal";

type AuthenticatedHandler<Request extends EventHandlerRequest, Response> = (
  event: H3Event<Request>,
  currentUser: AuthenticatedPrincipal,
) => Response | Promise<Response>;

export function defineAuthenticatedEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response = unknown,
>(handler: AuthenticatedHandler<Request, Response>): EventHandler<Request, Promise<Response>> {
  return defineEventHandler<Request, Promise<Response>>(async (event) => {
    const currentUser = await requireCurrentUser(event);
    return handler(event, currentUser);
  });
}
