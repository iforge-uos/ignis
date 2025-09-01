import { type Router, router } from "@/routes/api/$";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { SimpleCsrfProtectionLinkPlugin } from "@orpc/client/plugins";
import { type RouterClient, createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { type RouterUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

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
