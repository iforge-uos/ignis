import client from "@/db";
import config from "@/lib/env/server";
import serialisers from "@/lib/serialisers";
import { RepShape } from "@/lib/utils/queries";
import { pub } from "@/orpc";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
  experimental_ZodToJsonSchemaConverter as ZodToJsonSchemaConverter,
} from "@orpc/zod/zod4";
import e from "@packages/db/edgeql-js";
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

const createContext = async ({ request }: { request: Request }) => {
  const db = client;
  // const db = req.session?.client ?? client;
  return {
    user: await e
      .assert_exists(e.select(e.users.Rep, (u) => ({ ...RepShape(u), filter_single: { username: "eik21jh" } })))
      .run(db),
    // session: req.session,
    db: db.withGlobals({ ...config.db.globals }) as Executor,
    // req,
    // res,
  };
};

// const openAPIGenerator = new OpenAPIGenerator({
//   schemaConverters: [new ZodToJsonSchemaConverter()],
// });

const specFromRouter = await openAPIGenerator.generate(router, {
  info: {
    title: "iForge API",
    version: "2.0.0",
  },
});

const handler = new OpenAPIHandler(router, {
  plugins: [
    // biome-ignore format:
    new ZodSmartCoercionPlugin(),
    // new SimpleCsrfProtectionHandlerPlugin(),
  ],
  // customJsonSerializers: serialisers,
  interceptors: [onError(console.error)],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: await createContext({ request }),
  });

  return response ?? new Response("Not Found", { status: 404 });
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
