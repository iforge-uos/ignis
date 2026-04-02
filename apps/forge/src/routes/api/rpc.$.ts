import { createFileRoute } from "@tanstack/react-router"
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { InitialContext, router } from "./$";
import serialisers from "@/lib/serialisers";

const handler = new RPCHandler(router, { interceptors: [onError(console.error)], customJsonSerializers: serialisers });

async function handle({ request }: InitialContext) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: { request }, // Provide initial context if needed
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    // middleware: [authMiddleware],
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
