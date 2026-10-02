import { auth } from "@/orpc";
import { printersRoute } from "./printers";
import { usersRoute } from "./user";

export const publicPrintRouter = auth.prefix("/public").router({
  ...printersRoute,
  users: usersRoute,
});
