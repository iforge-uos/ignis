import e from "@packages/db/edgeql-js";
import { z } from "zod";
import { auth, pub, rep } from "@/orpc";
import { nameRoutes } from "./$name";
import { statuses } from "./statuses";
import { FullLocation } from "/src/lib/utils/queries";
import { HistoricQueue, HistoricSignIns, HistoricQueueShape, HistoricSignInsShape } from "./$name/sign-ins";

export const all = rep.route({ method: "GET", path: "/" }).handler(async ({ context: { db } }) =>
  e
    .assert_exists(
      e.select(e.sign_in.Location, (location) => ({
        ...FullLocation(location),
        historic_sign_ins: e.select(e.sign_in.SignIn, (sign_in) => ({
          ...HistoricSignInsShape(sign_in),
          limit: 20,
          offset: 0,
          filter: e.op(sign_in.location, "=", location),
        })),
        historic_queue: e.select(e.sign_in.QueuePlace, (place) => ({
          ...HistoricQueueShape(place),
          limit: 20,
          offset: 0,
          filter: e.op(place.location, "=", location),
        })),
      })),
    )
    .run(db),
);

export const update = rep
  .route({ method: "PATCH", path: "/{id}" })
  .input(z.object({ id: z.uuid() }))
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
