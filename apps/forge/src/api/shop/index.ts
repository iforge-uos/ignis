import { auth } from "@/orpc";
import { usersRouter } from "./users";

export const shopRouter = auth.prefix("/shop").router({
  usersRouter,
});
