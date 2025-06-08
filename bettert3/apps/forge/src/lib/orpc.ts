import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import { createRouterClient } from "@orpc/server";
import type { RouterClient } from "@orpc/server";
import { type RouterUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { toast } from "sonner";
import { Router, router } from "../../../anvil/src/routes";
import type { createRouter } from "../router";

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
        headers: getHeaders(), // provide headers if initial context required
      }),
    }),
  )
  .client(
    (): ORPCReactUtils =>
      createORPCClient(
        new RPCLink({
          url: `${window.location.origin}/api/rpc`,
        }),
      ),
  );

export const client: ORPCReactUtils = getORPCClient();

export const orpc = createORPCReactQueryUtils(client);

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
});
