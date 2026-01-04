import e from "@packages/db/edgeql-js";
import { z } from "zod";
import { auth, pub, rep } from "@/orpc";
import { nameRoutes } from "./$name";
import { statuses } from "./statuses";
import { FullLocation } from "/src/lib/utils/queries";
import { HistoricQueue, HistoricSignIns } from "./$name/historic";

export const all = rep
  .route({ method: "GET", path: "/" })
  .handler(async ({ context: { db } }) =>
    e
      .assert_exists(
        e.select(e.sign_in.Location, (location) => ({
          ...FullLocation(location),
          historic_sign_ins: HistoricSignIns(),
          historic_queue: HistoricQueue(),
        })),
      )
      .run(db),
  );

export const update = rep
  .route({ method: "PATCH", path: "/{id}" })
  .input(z.object({id: z.uuid()}))
  .handler(async ({ input: { id, ...rest }, context: { db } }) =>
    e
      .select(
        e.assert_exists(
          e.update(e.sign_in.Location, () => ({
            filter_single: { id },
            set: rest,
          })),
        ),
      )
      .run(db),
  );

export const locationsRouter = pub.prefix("/locations").router({
  all,
  update,
  statuses,
  ...nameRoutes,
});
