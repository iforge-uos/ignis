import "./instrument";
import e from "@dbschema/edgeql-js";
import { AuthRequest, CallbackRequest } from "@gel/auth-express";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { ORPCError, onError } from "@orpc/server";
import { RouterClient } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodAutoCoercePlugin } from "@orpc/zod";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import express, { Response } from "express";
import { AccessError, CardinalityViolationError, InvalidArgumentError } from "gel";
import authRoute from "./auth";
import config from "./config";
import client, { auth, onUserInsert } from "./db";
import { router } from "./routes";
import { UserShape } from "./utils/queries";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth.createSessionMiddleware());

app.use(authRoute);

// created for each request
const createContext = async ({ req, res }: { req: AuthRequest; res: Response }) => {
  return {
    user: await e.assert_single(e.select(e.user, UserShape)).run(client),
    session: req.session,
    db: client.withGlobals({ ...config.db.globals }),
    res,
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [new ZodAutoCoercePlugin(), new CORSPlugin()],
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
      throw error;
    }),
  ],
});

app.use("/api/*", async (req, res, next) => {
  const { matched } = await openAPIHandler.handle(req, res, {
    prefix: "/api",
    context: await createContext({ req, res }),
  });

  if (matched) {
    return;
  }

  next();
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

export type ORPCRouter = RouterClient<typeof router, Context>;
