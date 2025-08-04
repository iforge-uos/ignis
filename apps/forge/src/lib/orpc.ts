import serialisers from "@/lib/serialisers";
import { type Router, router } from "@/routes/api.$";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { SimpleCsrfProtectionLinkPlugin } from "@orpc/client/plugins";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import { type RouterClient, createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { type RouterUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { toast } from "sonner";

export type ORPCReactUtils = RouterUtils<RouterClient<Router>>;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      /**
       * Provide initial context if needed.
       *
       * Because this client instance is shared across all requests,
       * only include context that's safe to reuse globally.
       * For per-request context, use middleware context or pass a function as the initial context.
       */
      context: async () => ({
        request: getWebRequest(),
      }),
    }),
  )
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      plugins: [new SimpleCsrfProtectionLinkPlugin()],
    });

    return createORPCClient(link);
  });

export const client = getORPCClient();

export const orpc = createTanstackQueryUtils(client);

const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: serialisers,
});

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000, // > 0 to prevent immediate refetching on mount
    },
    dehydrate: {
      serializeData(data) {
        const [json, meta] = serializer.serialize(data);
        return { json, meta };
      },
    },
    hydrate: {
      deserializeData(data) {
        return serializer.deserialize(data.json, data.meta);
      },
    },
  },
});
