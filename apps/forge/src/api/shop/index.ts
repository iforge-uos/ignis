import { auth } from "@/orpc";
import { itemsRouter } from "./items";
import { usersRouter } from "./users";

export const shopRouter = auth.prefix("/shop").router({
  users: usersRouter,
  items: itemsRouter,
});
