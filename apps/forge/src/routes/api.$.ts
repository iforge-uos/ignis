import client from "@/db";
import config from "@/lib/env/server";
import serialisers from "@/lib/serialisers";
import { RepShape, UserShape } from "@/lib/utils/queries";
import { pub } from "@/orpc";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from "@orpc/zod";
import e, { $infer } from "@packages/db/edgeql-js";
import * as Sentry from "@sentry/node";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { Executor } from "gel";

import { agreementsRouter } from "@/api/agreements";
import { authRouter } from "@/api/auth";
import { deployRouter } from "@/api/deploy";
import { locationsRouter } from "@/api/locations";
import { notificationsRouter } from "@/api/notifications";
import { signInsRouter } from "@/api/sign-ins";
import { teamsRouter } from "@/api/teams";
import { trainingRouter } from "@/api/training";
import { usersRouter } from "@/api/users";
import { OpenAPIGenerator } from "@orpc/openapi";
import { onError } from "@orpc/server";
import { createMiddleware, json } from "@tanstack/react-start";

export const router = pub.router({
  auth: authRouter,
  agreements: agreementsRouter,
  locations: locationsRouter,
  notifications: notificationsRouter,
  signIns: signInsRouter,
  teams: teamsRouter,
  training: trainingRouter,
  users: usersRouter,
  deploy: deployRouter,
});

export type Router = typeof router;
export type Context = Awaited<ReturnType<typeof createContext>>;

export const createContext = async ({ request }: { request: Request }) => {
  const db = client;
  // const db = req.session?.client ?? client;
  return {
    user: await e.select(e.users.User, (u) => ({ ...UserShape(u), filter_single: { username: "eik21jh" } })).run(db),
    // session: req.session,
    db: db.withGlobals({ ...config.db.globals }) as Executor,
    // req,
    // res,
  };
};

const _user = e.assert_single(e.assert_exists(e.user));

export interface AuthContext extends Context {
  user: $infer<typeof UserShape>[number];
  $user: typeof _user;
}

// const openAPIGenerator = new OpenAPIGenerator({
//   schemaConverters: [new ZodToJsonSchemaConverter()],
// });

// const specFromRouter = await openAPIGenerator.generate(router, {
//   info: {
//     title: "iForge API",
//     version: "2.0.0",
//   },
//   exclude: (procedure, path) => !!procedure["~orpc"].route.tags?.includes("hidden"),
// });

const handler = new OpenAPIHandler(router, {
  plugins: [
    // biome-ignore format:
    new ZodSmartCoercionPlugin(),
    // new SimpleCsrfProtectionHandlerPlugin(),
  ],
  customJsonSerializers: serialisers,
  interceptors: [onError(console.error)],
});

async function handle({ request }: { request: Request }) {
  const { pathname } = new URL(request.url);
  // if (pathname === "/api/spec.json") {
  //   return json(specFromRouter);
  // }
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: await createContext({ request }),
  });

  return response ?? new Response("Not Found", { status: 404 });
  // } catch (e) {
  // console.log("created new event", Sentry.captureException(e));
  // }
}

export const ServerRoute = createServerFileRoute("/api/$").methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
  OPTIONS: handle,
});
