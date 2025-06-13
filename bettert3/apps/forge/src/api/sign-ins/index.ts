import { rep } from "@/orpc";
import { idRouter } from "./$id";
import { reasonsRouter } from "./reasons";

export const signInsRouter = rep.prefix("/sign-ins").router({
  ...idRouter,
  reasons: reasonsRouter,
});
