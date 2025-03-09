import e from "@dbschema/edgeql-js";
import { CallbackRequest } from "@gel/auth-express";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { RPCHandler } from "@orpc/server/node";
import { ZodAutoCoercePlugin } from "@orpc/zod";
import cookieParser from "cookie-parser";
import express from "express";
import authRoute from "./auth";
import { auth, onUserInsert } from "./db";
import { PartialUserShape } from "./utils/queries";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth.createSessionMiddleware());

app.use(authRoute);

const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [new ZodAutoCoercePlugin()],
});

app.use("/api/*", async (req, res, next) => {
  const { matched } = await openAPIHandler.handle(req, res, {
    prefix: "/api",
    context: {},
  });

  if (matched) {
    return;
  }

  next();
});

const rpcHandler = new RPCHandler(router);

app.use("/rpc/*", async (req, res, next) => {
  const { matched } = await rpcHandler.handle(req, res, {
    prefix: "/rpc",
    context: {},
  });

  if (matched) {
    return;
  }

  next();
});
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
