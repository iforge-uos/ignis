import e from "@packages/db/edgeql-js";
import { z } from "zod";
import { auth, pub, rep } from "@/orpc";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";

export const HistoricSignIns = ({ offset, limit }: { offset: number; limit: number } = { offset: 0, limit: 20 }) =>
  e.params({ name: e.sign_in.LocationName }, ({ name }) =>
    e.select(e.sign_in.SignIn, (sign_in) => ({ filter: e.op(sign_in.location.name, "=", name), limit, offset })),
  );

export const historicSignIns = rep
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      name: LocationNameSchema,
      offset: z.number(),
      limit: z.number(),
    }),
  )
  .handler(async ({ input, context: { db } }) => HistoricSignIns(input).run(db, input));

export const HistoricQueue = ({ offset, limit }: { offset: number; limit: number } = { offset: 0, limit: 20 }) =>
  e.params({ name: e.sign_in.LocationName }, ({ name }) =>
    e.select(e.sign_in.QueuePlace, (place) => ({ filter: e.op(place.location.name, "=", name), limit, offset })),
  );

export const update = rep
  .route({ method: "PATCH", path: "/path/{id}" })
  .input(
    z.object({
      name: LocationNameSchema,
      offset: z.number(),
      limit: z.number(),
    }),
  )
  .handler(async ({ input, context: { db } }) =>
    HistoricQueue(input).run(db, input)
  );
