import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { printerSchema, toFilamentSlots } from "@/lib/printers/utils";
import { auth, ensurePrinters } from "@/orpc";
import { nameRoutes } from "./$name";
import { admin } from "./admin";
import { historyRouter } from "./history";
import { printerRouter } from "./printer";
import { publicPrintRouter } from "./public";
import { queueRouter } from "./queue";

const locationOptions = z.enum([...LocationNameSchema.options, "ALL"]);

export const list = auth
  .route({ method: "GET", path: "/" })
  .use(ensurePrinters)
  .input(z.object({ location: locationOptions, include_old: z.boolean().default(false) }))
  .output(z.array(printerSchema))
  .handler(async ({ input: { location, include_old }, context: { db } }) => {
    const printers = await e
      .select(e.printing.Printer, (p) => {
        const in_location =
          location === locationOptions.enum.ALL
            ? e.bool(true)
            : e.op(p.location.name, "=", e.cast(e.sign_in.LocationName, location));
        return {
          id: true,
          name: true,
          manufacturer: true,
          driver: true,
          model: true,
          has_camera: true,
          filament: true,
          location: { name: true },
          total_print_mass: true,
          total_print_time: true,
          old: true,
          filter: include_old ? in_location : e.op(in_location, "and", e.op("not", p.old)),
        };
      })
      .run(db);
    return printers.map((p) => ({ ...p, location: p.location.name, filament: toFilamentSlots(p.filament) }));
  });

export const printRouter = auth.prefix("/print").router({
  history: historyRouter,
  printer: printerRouter,
  queue: queueRouter,
  name: nameRoutes,
  public: publicPrintRouter,
  list,
  admin,
});
