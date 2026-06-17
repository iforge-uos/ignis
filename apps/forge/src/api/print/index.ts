import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { printerSchema, toFilamentSlots } from "@/lib/printers/utils";
import { auth, printing } from "@/orpc";
//import { queueRouter } from "./queue";
import { nameRoutes } from "./$name";
import { historyRouter } from "./history";
import { printerRouter } from "./printer";

export const list = printing
  .route({ method: "GET", path: "/" })
  .input(z.object({ location: z.union([LocationNameSchema, z.literal("All")]) }))
  .output(z.array(printerSchema))
  .handler(async ({ input: { location }, context: { db } }) => {
    const printers = await e
      .select(e.printing.Printer, (p) => ({
        id: true,
        name: true,
        manufacturer: true,
        model: true,
        has_camera: true,
        filament: true,
        location: p.location.name,
        total_print_mass: true,
        total_print_time: true,
        ...(location === "All" ? {} : { filter: e.op(p.location.name, "=", e.cast(e.sign_in.LocationName, location)) }),
      }))
      .run(db);
    return printers.map((p) => ({ ...p, filament: toFilamentSlots(p.filament) }));
  });

export const printRouter = auth.prefix("/print").router({
  ...historyRouter,
  ...printerRouter,
  //    ...queueRouter
  ...nameRoutes,
  list,
});
