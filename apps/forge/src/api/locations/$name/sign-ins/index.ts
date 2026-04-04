import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { z } from "zod";
import { auth, pub, rep } from "@/orpc";
import { PartialUserShape } from "/src/lib/utils/queries";
import { UCardNumber } from "../sign-in/_flows/_steps";
import { ldapLibraryToUcardNumber } from "/src/lib/utils/sign-in";

/**
 * Instantly sign in as a rep using the space.
 */
export const create = rep
  .route({ path: "/", method: "POST" })
  .input(z.object({ name: LocationNameSchema, reason: z.object({ id: z.uuid() }) }))
  .handler(async ({ input: { name, reason }, context: { db, $user } }) =>
    e
      .insert(e.sign_in.SignIn, {
        user: $user,
        reason: e.assert_exists(e.select(e.sign_in.Reason, () => ({ filter_single: reason }))),
        tools: [],
        location: e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } }))),
      })
      .run(db),
  );

const CurrentSignInShape = (ucard_number: string, name: string) =>
  e.shape(e.sign_in.SignIn, (sign_in) => ({
    filter_single: e.all(
      e.set(
        e.op(sign_in.user.ucard_number, "=", ldapLibraryToUcardNumber(ucard_number)),
        e.op(sign_in.location.name, "=", e.cast(e.sign_in.LocationName, name)),
        e.op("not", sign_in.signed_out),
      ),
    ),
  }));

export const get = rep
  .route({ path: "/", method: "GET" })
  .input(z.object({ name: LocationNameSchema, ucard_number: UCardNumber }))
  .handler(async ({ input: { name, ucard_number }, context: { db } }) =>
    e
      .select(e.sign_in.SignIn, CurrentSignInShape(ucard_number, name))
      .run(db),
  );

export const HistoricSignInsShape = e.shape(e.sign_in.SignIn, () => ({
  id: true,
  user: PartialUserShape,
  created_at: true,
  ends_at: true,
  _tools: { id: true, name: true },
  reason: { name: true },
}));

export const HistoricSignIns = ({ offset, limit }: { offset: number; limit: number } = { offset: 0, limit: 20 }) =>
  e.params({ name: e.sign_in.LocationName }, ({ name }) =>
    e.select(e.sign_in.SignIn, (sign_in) => ({
      filter: e.op(sign_in.location.name, "=", name),
      limit,
      offset,
      order_by: {
        expression: sign_in.ends_at,
        direction: "DESC",
        empty: "EMPTY LAST",
      },
      ...HistoricSignInsShape(sign_in),
    })),
  );

export const all = rep
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      name: LocationNameSchema,
      offset: z.number(),
      limit: z.number(),
    }),
  )
  .handler(async ({ input, context: { db } }) => HistoricSignIns(input).run(db, { name: input.name }));

export const HistoricQueueShape = e.shape(e.sign_in.QueuePlace, () => ({
  user: PartialUserShape,
  created_at: true,
  ends_at: true,
  notified_at: true,
}));

export const HistoricQueue = ({ offset, limit }: { offset: number; limit: number } = { offset: 0, limit: 20 }) =>
  e.params({ name: e.sign_in.LocationName }, ({ name }) =>
    e.select(e.sign_in.QueuePlace, (place) => ({
      filter: e.op(place.location.name, "=", name),
      limit,
      offset,
      ...HistoricQueueShape(place),
    })),
  );

// export const update = rep
//   .route({ method: "PATCH", path: "/{id}" })
//   .input(
//     z.object({
//       name: LocationNameSchema,
//       id: z.uuid(),
//     }),
//   )
//   .handler(async ({ input, context: { db } }) =>
//     HistoricQueue(input).run(db, input)
//   );

export const out = rep
  .route({ path: "/out", method: "GET" })
  .input(z.object({ name: LocationNameSchema, ucard_number: UCardNumber }))
  .handler(async ({ input: { name, ucard_number }, context: { db } }) =>
    e
      .update(e.sign_in.SignIn, (sign_in) => ({
        ...CurrentSignInShape(ucard_number, name)(sign_in),
        set: {
          ends_at: e.datetime_of_statement(),
        },
      }))
      .run(db),
  );

export const signInsRouter = rep.prefix("/sign-ins").router({
  create,
  all,
  out,
  // update,
});
