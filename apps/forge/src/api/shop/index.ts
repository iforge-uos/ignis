import { pub } from "@/orpc";
import { itemsRouter } from "./items";
import { usersRouter } from "./users";

export const shopRouter = pub.prefix("/shop").router({
  users: usersRouter,
  items: itemsRouter,
});
