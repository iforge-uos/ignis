import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { createContext, router } from "./api.$";

const handler = new RPCHandler(router, { interceptors: [onError(console.error)] });

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: await createContext({ request }), // Provide initial context if needed
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
