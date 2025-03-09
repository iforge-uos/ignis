import { rep } from "@/router";
import e from "@dbschema/edgeql-js";
import { z } from "zod";
import { get } from "./$id";
import { reasonsRouter } from "./reasons";
// import { history } from "./history";

export const signInsRouter = rep.prefix("/sign-ins").router({
  get,
  // history,
  reasons: reasonsRouter,
});
