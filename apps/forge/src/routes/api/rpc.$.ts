import { onError } from "@orpc/server";
import { CompressionPlugin, RPCHandler } from "@orpc/server/fetch";
import { createFileRoute } from "@tanstack/react-router";
import serialisers from "@/lib/serialisers";
import { router } from "./$";
import { withSession } from "@/lib/utils/auth";

export const handler = new RPCHandler(router, {
  interceptors: [onError(console.error)],
  customJsonSerializers: serialisers,
  plugins: [new CompressionPlugin()],
});

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    middleware: [withSession],
    handlers: {
      ANY: async ({ request, context }) => {
        const { response } = await handler.handle(request, {
          prefix: "/api/rpc",
          context,
        });

        return response ?? new Response("Not Found", { status: 404 });
      },
    },
  },
});
