import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { InitialContext, router } from "./api.$";
import serialisers from "@/lib/serialisers";

const handler = new RPCHandler(router, { interceptors: [onError(console.error)], customJsonSerializers: serialisers });

async function handle({ request }: InitialContext) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: { request }, // Provide initial context if needed
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute("/api/rpc/$").methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
  OPTIONS: handle,
});
