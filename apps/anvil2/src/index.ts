import "./instrument";
import e from "@db/edgeql-js";
import { AuthRequest, CallbackRequest } from "@gel/auth-express";
import { Temporal } from "@js-temporal/polyfill";
import { StandardRPCCustomJsonSerializer } from "@orpc/client/standard";
import { AnySchema } from "@orpc/contract";
import { ConditionalSchemaConverter, JSONSchema, OpenAPIGenerator, SchemaConvertOptions } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { ORPCError, onError } from "@orpc/server";
import { RouterClient } from "@orpc/server";
import { CORSPlugin, SimpleCsrfProtectionHandlerPlugin } from "@orpc/server/plugins";
import { ZodSmartCoercionPlugin } from "@orpc/zod";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import express, { Response } from "express";
import { AccessError, CardinalityViolationError, Duration, InvalidArgumentError } from "gel";
import z from "zod";
import config from "./config";
import client, { auth, onUserInsert } from "./db";
import { router } from "./routes";
import authRoute from "./routes/auth";
import { RepShape, UserShape } from "./utils/queries";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth.createSessionMiddleware());
app.disable("x-powered-by");

app.use(authRoute);

// created for each request
const createContext = async ({ req, res }: { req: AuthRequest; res: Response }) => {
  return {
    user: await e
      .assert_exists(e.select(e.users.Rep, (u) => ({ ...RepShape(u), filter_single: { username: "eik21jh" } })))
      .run(client),
    session: req.session,
    db: client.withGlobals({ ...config.db.globals }),
    res,
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

export const durationSerializer: StandardRPCCustomJsonSerializer = {
  type: 21,
  condition: (data) => data instanceof Duration || data instanceof Temporal.Duration,
  serialize: (data) => data.toJSON(),
  deserialize: Temporal.Duration.from,
};

const handler = new OpenAPIHandler(router, {
  plugins: [
    // biome-ignore format:
    // new ZodSmartCoercionPlugin(),
    new CORSPlugin({ origin: process.env.FRONT_END_URL as string, credentials: true }),
    // new SimpleCsrfProtectionHandlerPlugin(),
  ],
  customJsonSerializers: [durationSerializer],
  interceptors: [
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
  ],
});

class ZodToJsonSchemaConverter implements ConditionalSchemaConverter {
  condition(schema: AnySchema | undefined): boolean {
    return schema !== undefined && schema["~standard"].vendor === "zod";
  }

  convert(
    schema: AnySchema | undefined,
    _options: SchemaConvertOptions,
  ): [required: boolean, jsonSchema: Exclude<JSONSchema, boolean>] {
    // Most JSON schema converters do not convert the `required` property separately, so returning `true` is acceptable here.
    return [true, z.toJSONSchema(schema as any, { unrepresentable: "any" })];
  }
}

const spec = await new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
}).generate(router, {
  info: {
    title: "iForge API",
    version: "2.0.0",
  },
  servers: [{ url: "/api" } /** Should use absolute URLs in production */],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
});

app.use("/api/*", async (req, res, next) => {
  if (req.originalUrl === "/api/spec.json") {
    return res.json(spec);
  }
  if (req.originalUrl === "/api/spec.html") {
    return res.sendFile("spec.html", { root: "src" });
  }

  const { matched } = await handler.handle(req, res, {
    prefix: "/api",
    context: await createContext({ req, res }),
  });

  if (matched) {
    return;
  }

  next();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export type ORPCRouter = RouterClient<typeof router, Context>;
