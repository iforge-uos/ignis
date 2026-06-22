import { printing } from "@/orpc";
import { nameRoutes } from "./$name";
import { downtimeRoutes } from "./downtime";

export const printerRouter = printing.prefix("/printer").router({
  nameRoutes,
  downtimeRoutes,
});
