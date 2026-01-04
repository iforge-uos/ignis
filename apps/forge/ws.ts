import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/bun-ws";
import { getCookie } from "@orpc/server/helpers";
import { Serve } from "bun";
import { DEFAULT_AUTH_COOKIE } from "@/lib/constants";
import db from "./src/db";
import serialisers from "./src/lib/serialisers";
import { router } from "./src/routes/api/$";

const rpcHandler = new RPCHandler(router, {
  interceptors: [onError(console.error)],
  customJsonSerializers: serialisers,
});

type WSContext = { authToken?: string };

// Store the auth token from the WebSocket handshake
const wsAuthTokens = new WeakMap<Bun.ServerWebSocket<WSContext>, string | undefined>();

export default {
  fetch(req, server) {
    // Read session cookie from the upgrade request
    const authToken = getCookie(req.headers, DEFAULT_AUTH_COOKIE);

    if (server.upgrade(req, { data: { authToken } })) {
      return;
    }

    return new Response("Upgrade failed", { status: 500 });
  },

  websocket: {
    open(ws) {
      // Store the auth token from handshake, we cannot get it any other way as its HttpOnly
      wsAuthTokens.set(ws, ws.data?.authToken);
    },
    message(ws, message) {
      const authToken = wsAuthTokens.get(ws);
      rpcHandler.message(ws, message, {
        context: {
          session: { client: db.withGlobals({ "ext::auth::client_token": authToken }) },
        },
      });
    },
    close(ws) {
      wsAuthTokens.delete(ws);
      rpcHandler.close(ws);
    },
  },
} satisfies Serve.Options<WSContext>;
