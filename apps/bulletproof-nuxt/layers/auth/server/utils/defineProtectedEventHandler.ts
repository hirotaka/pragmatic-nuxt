import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import type { UserRecord } from "#layers/users/server/repository/userRepository";

type ProtectedEventHandler<
  Request extends EventHandlerRequest,
  Response,
> = (event: H3Event<Request>, currentUser: UserRecord) => Response | Promise<Response>;

export function defineProtectedEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response = unknown,
>(handler: ProtectedEventHandler<Request, Response>): EventHandler<Request, Promise<Response>> {
  return defineEventHandler<Request, Promise<Response>>(async (event) => {
    const currentUser = await requireCurrentUser(event);

    return handler(event, currentUser);
  });
}
