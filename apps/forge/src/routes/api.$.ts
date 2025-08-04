import serialisers from "@/lib/serialisers";
import { pub } from "@/orpc";
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { agreementsRouter } from "@/api/agreements";
import { authRouter } from "@/api/auth";
import { deployRouter } from "@/api/deploy";
import { locationsRouter } from "@/api/locations";
import { notificationsRouter } from "@/api/notifications";
import { signInsRouter } from "@/api/sign-ins";
import { teamsRouter } from "@/api/teams";
import { trainingRouter } from "@/api/training";
import { usersRouter } from "@/api/users";

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
export type InitialContext = {
  request: Request
}

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

const specFromRouter = await openAPIGenerator.generate(router, {
  info: {
    title: "iForge API",
    version: "2.0.0",
  },
  exclude: (procedure, path) => !!procedure["~orpc"].route.tags?.includes("hidden"),
});

const handler = new OpenAPIHandler(router, {
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
    new SimpleCsrfProtectionHandlerPlugin(),
  ],
  customJsonSerializers: serialisers,
  interceptors: [onError(console.error)],
});

async function handle({ request }: { request: Request }) {
  const { pathname } = new URL(request.url);
  if (pathname === "/api/spec.json") {
    return json(specFromRouter);
  }
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {request},
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
