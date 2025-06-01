import "dotenv/config";
import { RPCHandler } from "@orpc/server/node";
import cors from "cors";
import express from "express";
import { appRouter } from "./routers";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "",
  }),
);

const handler = new RPCHandler(appRouter);
app.use("/rpc{*path}", async (req, res, next) => {
  const { matched } = await handler.handle(req, res, {
    prefix: "/rpc",
    context: {},
  });
  if (matched) return;
  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
