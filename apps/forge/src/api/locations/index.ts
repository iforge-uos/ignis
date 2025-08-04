import { pub } from "@/orpc";
import { statuses } from "./statuses";
import { nameRoutes } from "./$name";

export const locationsRouter = pub.prefix("/locations").router({
  statuses,
  ...nameRoutes,
});
