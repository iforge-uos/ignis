import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/websocket";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils, type RouterUtils } from "@orpc/tanstack-query";
import { redirect, useLocation } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { WebSocket } from "partysocket";
import dbClient from "@/db";
import { DEFAULT_AUTH_COOKIE } from "@/lib/constants";
import serialisers from "@/lib/serialisers";
import { type Router, router } from "@/routes/api/$";

export type ORPCReactUtils = RouterUtils<RouterClient<Router>>;

let websocketInstance: WebSocket | null = null;
let clientInstance: RouterClient<typeof router> | null = null;

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
    plugins: [],
    interceptors: [onError(console.error)],
    clientInterceptors: [
      async ({ next, request }) => {
        const response = await next();
        if (response.status === 401) {
          throw redirect({ to: "/auth/login", search: { redirect: window.location.pathname } });
        }
        return response;
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
