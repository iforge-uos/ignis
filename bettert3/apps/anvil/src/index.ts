import "./instrument";
import e from "@db/edgeql-js";
import { AuthRequest } from "@gel/auth-express";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError } from "@orpc/server";
import { RouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { CORSPlugin } from "@orpc/server/plugins";
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
  experimental_ZodToJsonSchemaConverter as ZodToJsonSchemaConverter,
} from "@orpc/zod/zod4";
import serialisers from "@packages/serialiser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Response } from "express";
import { AccessError, CardinalityViolationError, Executor, InvalidArgumentError } from "gel";
import config from "./config";
import client, { auth, onUserInsert } from "./db";
import { type Router, router } from "./routes";
import authRoute from "./routes/auth";
import { RepShape, UserShape } from "./utils/queries";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth.createSessionMiddleware());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "",
  }),
);

app.disable("x-powered-by");

app.use(authRoute);

// created for each request
const createContext = async ({ req, res }: { req: AuthRequest; res: Response }) => {
  const db = req.session?.client ?? client;
  return {
    user: await e
      .assert_exists(e.select(e.users.Rep, (u) => ({ ...RepShape(u), filter_single: { username: "eik21jh" } })))
      .run(db),
    session: req.session,
    db: db.withGlobals({ ...config.db.globals }) as Executor,
    req,
    res,
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

const interceptors = [
  onError((error) => {
    // Some errors can be suppressed so just re-throw
    if (error instanceof InvalidArgumentError) {
      throw new ORPCError("NOT_FOUND", {
        message: `${"path"} with id ${"23123"} not found`,
        cause: error,
      });
    }
    if (error instanceof CardinalityViolationError) {
      throw new ORPCError("NOT_FOUND", {
        message: `${"path"} with id ${"23123"} not found`,
        cause: error,
      });
    }
    if (error instanceof AccessError) {
      error = new ORPCError("FORBIDDEN", {
        message: error.message,
        cause: error,
      });
    }

    Sentry.captureException(error);
    console.error(error);
    throw error;
  }),
];

const handler = new OpenAPIHandler(router, {
  plugins: [
    // biome-ignore format:
    new ZodSmartCoercionPlugin(),
    // new SimpleCsrfProtectionHandlerPlugin(),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "iForge API",
          version: "2.0.0",
        },
      },
      // servers: [{ url: "/api" } /** Should use absolute URLs in production */],
      // security: [{ bearerAuth: [] }],
      // components: {
      //   securitySchemes: {
      //     bearerAuth: {
      //       type: "http",
      //       scheme: "bearer",
      //     },
      //   },
      // },
    }),
  ],
  customJsonSerializers: serialisers,
  interceptors,
});

const rpcHandler = new RPCHandler(router, { customJsonSerializers: serialisers, interceptors });

// app.use("/api/rpc/*", async (req, res, next) => {
//   const { matched } = await rpcHandler.handle(req, res, {
//     prefix: "/api/rpc",
//     context: await createContext({ req, res }),
//   });
//   if (matched) return;
//   next();
// });

// app.use("/api/*", async (req, res, next) => {
//   if (req.originalUrl === "/api/spec.html") {
//     return res.redirect("https://docs.iforge.shef.ac.uk/api");
//   }

//   const { matched } = await handler.handle(req, res, {
//     prefix: "/api",
//     context: await createContext({ req, res }),
//   });
//   if (matched) return;
//   next();
// });

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

export type ORPCRouter = RouterClient<Router, Context>;
