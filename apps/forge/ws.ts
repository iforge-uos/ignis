import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/bun-ws";
import { getCookie } from "@orpc/server/helpers";
import { Serve } from "bun";

// use relative paths below, path aliases don't work at this stage
import db from "./src/db";
import { DEFAULT_AUTH_COOKIE } from "./src/lib/constants";
import { logUnexpectedError } from "./src/lib/orpc-errors";
import serialisers from "./src/lib/serialisers";
import { router } from "./src/routes/api/$";

const rpcHandler = new RPCHandler(router, {
  interceptors: [onError(logUnexpectedError)],
  customJsonSerializers: serialisers,
});

type WSContext = { authToken?: string };

/** True for the normal "client went away mid-stream" rejection, at any depth of the cause chain. */
function isAbort(error: unknown, depth = 0): boolean {
  if (!(error instanceof Error) || depth > 10) return false;
  if (error.name === "AbortError" || error.message.includes("closed or aborted")) return true;
  return isAbort(error.cause, depth + 1);
}

// Store the auth token from the WebSocket handshake
const wsAuthTokens = new WeakMap<Bun.ServerWebSocket<WSContext>, string | undefined>();

export function handleWebSocketUpgrade(req: Request, server: Bun.Server<WSContext>) {
  const url = new URL(req.url);
  if (url.pathname === "/ws") {
    // Read session cookie from the upgrade request
    const authToken = getCookie(req.headers, DEFAULT_AUTH_COOKIE);

    if (server.upgrade(req, { data: { authToken } })) {
      return;
    }

    return new Response("Upgrade failed", { status: 400 });
  }

  return new Response("Not found", { status: 404 });
}

export default {
  fetch(req, server) {
    return handleWebSocketUpgrade(req, server);
  },

  websocket: {
    open(ws) {
      // Store the auth token from handshake, we cannot get it any other way as its HttpOnly
      wsAuthTokens.set(ws, ws.data?.authToken);
    },
    message(ws, message) {
      const authToken = wsAuthTokens.get(ws);
      // `message` is async and Bun kills the process on an unhandled rejection, so own the failure
      // here. A disconnect mid-stream aborts the peer's queues, which rejects this promise with an
      // ErrorEvent wrapping an AbortError — expected, not worth logging.
      rpcHandler
        .message(ws, message, {
          context: {
            session: { client: db.withGlobals({ "ext::auth::client_token": authToken }) },
          },
        })
        .catch((error: unknown) => {
          if (isAbort(error)) return;
          console.error("oRPC websocket message failed", error);
        });
    },
    close(ws) {
      wsAuthTokens.delete(ws);
      rpcHandler.close(ws);
    },
  },
} satisfies Serve.Options<WSContext>;
