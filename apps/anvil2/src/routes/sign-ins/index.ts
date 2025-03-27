import { rep } from "@/router";
import { z } from "zod";
import { get } from "./$id";
import { reasonsRouter } from "./reasons";

export const signInsRouter = rep.prefix("/sign-ins").router({
  get,
  reasons: reasonsRouter,
});
