import { auth } from "@/router";
import { statuses } from "./statuses";
import { nameRoutes } from "./$name";

export const locationsRouter = auth.prefix("/locations").router({
  statuses,
  ...nameRoutes,
});
 