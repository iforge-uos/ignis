import type { Context } from "@/index";
import type { Router } from "@/routes";
import type { RouterClient } from "@orpc/server";

export type ORPCRouter = RouterClient<Router, Context>;
