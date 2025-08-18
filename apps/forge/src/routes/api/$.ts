import serialisers from "@/lib/serialisers";
import { pub } from "@/orpc";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createMiddleware, json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { adminRouter } from "@/api/admin";
import { agreementsRouter } from "@/api/agreements";
import { authRouter } from "@/api/auth";
import { deployRouter } from "@/api/deploy";
import { eventsRouter } from "@/api/events";
import { locationsRouter } from "@/api/locations";
import { notificationsRouter } from "@/api/notifications";
import { shopRouter } from "@/api/shop";
import { signInsRouter } from "@/api/sign-ins";
import { teamsRouter } from "@/api/teams";
import { trainingRouter } from "@/api/training";
import { usersRouter } from "@/api/users";


export const router = pub.router({
  admin: adminRouter,
  agreements: agreementsRouter,
  auth: authRouter,
  deploy: deployRouter,
  events: eventsRouter,
  locations: locationsRouter,
  notifications: notificationsRouter,
  shop: shopRouter,
  signIns: signInsRouter,
  teams: teamsRouter,
  training: trainingRouter,
  users: usersRouter,
});

export type Router = typeof router;
export type InitialContext = {
  request: Request;
};

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
    // new SmartCoercionPlugin({
    //   schemaConverters: [new ZodToJsonSchemaConverter()],
    // }),
    // new SimpleCsrfProtectionHandlerPlugin(),
  ],
  customJsonSerializers: serialisers,
  interceptors: [onError(console.error)],
});

interface HandlerProps {
  request: Request;
  context: {
    isAwesome: boolean;
  };
}

async function handle({ request, context }: HandlerProps) {
  const { pathname } = new URL(request.url);
  if (pathname === "/api/spec.json") {
    return json(specFromRouter);
  }
  if (pathname === "/api/spec.html") {
    return new Response(
      `
    <!doctype html>
    <html>
      <head>
        <title>My Client</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/api/spec.json',
            servers: [{
               url: "http://localhost:3000/api",
                description: "Server for testing override"
            }],
            authentication: {
              securitySchemes: {
                bearerAuth: {
                  token: 'default-token',
                },
              },
            },
          })
        </script>
      </body>
    </html>
  `,
      { status: 200, headers: { "Content-Type": "text/html" } },
    );
  }
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: { request },
  });

  return response ?? new Response("Not Found", { status: 404 });
}

const awesomeMiddleware = createMiddleware({ type: "request" }).server(({ next }) => {
  return next({
    context: {
      isAwesome: Math.random() > 0.5,
    },
  });
});

export const ServerRoute = createServerFileRoute("/api/$").middleware([awesomeMiddleware]).methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
  OPTIONS: handle,
});
