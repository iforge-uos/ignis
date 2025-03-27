import type { Context } from "@anvil/index";
import type { Router } from "@anvil/routes";
import type { RouterClient } from "@orpc/server";

export type ORPCRouter = RouterClient<Router, Context>;
