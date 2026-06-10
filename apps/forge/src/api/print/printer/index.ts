import { printing } from "@/orpc";
import { nameRoutes } from "./$name"

export const printerRouter = printing.prefix("/printing").router({
    nameRoutes,
});