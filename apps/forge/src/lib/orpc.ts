import { createORPCClient, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/websocket";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils, type RouterUtils } from "@orpc/tanstack-query";
import { redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { WebSocket } from "partysocket";
import { toast } from "sonner";
import dbClient from "@/db";
import { DEFAULT_AUTH_COOKIE } from "@/lib/constants";
import serialisers from "@/lib/serialisers";
import { handleSignout } from "@/lib/utils/auth";
import { type Router, router } from "@/routes/api/$";

export type ORPCReactUtils = RouterUtils<RouterClient<Router>>;

let websocketInstance: WebSocket | null = null;
let clientInstance: RouterClient<typeof router> | null = null;

let endingStaleSession: Promise<void> | null = null;

/**
 * The server has told us our cookie can't be verified any more
 */
function endStaleSession(): Promise<void> {
  endingStaleSession ??= (async () => {
    toast.error("Your session has expired, please sign in again.");
    try {
      await handleSignout();
    } catch (error) {
      console.error("Failed to clear the stale session cookie", error);
    }
    if (window.location.pathname.startsWith("/auth/")) return;
    // A full navigation rather than a router one: both the router context and the websocket's
    // handshake were built around the session that just died.
    window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  })();
  return endingStaleSession;
}

function createWebSocketClient(): RouterClient<typeof router> {
  const secure = window.location.protocol === "https:";
  const protocol = secure ? "wss:" : "ws:";
  const hostname = window.location.host.split(":")[0];
  let port: string;
  if (secure) {
    port = ""; // prod
  } else if (process.env.NODE_ENV === "production") {
    port = ":3000"; // local preview
  } else {
    port = ":3001"; // local dev
  }
  // Cookies are automatically sent in the WebSocket handshake
  websocketInstance = new WebSocket(`${protocol}//${hostname}${port}/ws`);
  const link = new RPCLink({
    websocket: websocketInstance as any,
    customJsonSerializers: serialisers,
    // Outermost, so the response has already been decoded into an ORPCError and we can tell the
    // kinds of 401 apart — a client interceptor only ever sees the raw status.
    interceptors: [
      async ({ next, path }) => {
        try {
          return await next();
        } catch (error) {
          // Navigating away aborts the page's streams (e.g. the sign-in flow finishing), that's not an error
          if (error instanceof Error && error.name === "AbortError") throw error;
          if (error instanceof ORPCError && error.code === "SESSION_EXPIRED") {
            await endStaleSession();
            throw error;
          }
          if (error instanceof ORPCError && error.status === 401 && path.join("/") !== "users/me") {
            // Ignore 401 auto-redirects on session check endpoints
            throw redirect({ to: "/auth/login", search: { redirect: window.location.pathname } });
          }
          console.error(error);
          const message = error instanceof Error ? error.message.trim() : "";
          if (message) {
            toast.error(message);
          }
          throw error;
        }
      },
    ],
  });
  return createORPCClient(link);
}

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      // Per-request initial context
      context: async () => ({
        session: {
          client: dbClient.withGlobals({ "ext::auth::client_token": getCookie(DEFAULT_AUTH_COOKIE) }),
        },
      }),
    }),
  )
  .client((): RouterClient<typeof router> => {
    if (!clientInstance) {
      clientInstance = createWebSocketClient();
    }
    return clientInstance;
  });

export const client = getORPCClient();

export const orpc = createTanstackQueryUtils(client);

export function reconnectWebSocket() {
  if (typeof window === "undefined") return;

  if (websocketInstance) {
    websocketInstance.close();
  }

  clientInstance = createWebSocketClient();
}
