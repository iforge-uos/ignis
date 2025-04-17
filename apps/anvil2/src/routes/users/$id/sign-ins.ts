import { auth } from "@/router";
import e from "@db/edgeql-js";
import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

export const signIns = auth
  .route({ path: "/sign-ins" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .group(
        e.select(e.sign_in.SignIn, (sign_in) => ({
          filter: e.op(sign_in.user.id, "=", e.cast(e.uuid, id)),
        })),
        (sign_in) => ({
          id: true,
          location: { name: true },
          ends_at: true,
          created_at: true,
          duration: true,
          by: { created_at: e.datetime_truncate(sign_in.created_at, "days") },
        }),
      )
      .run(db)
      .then((groupings) =>
        groupings.map((group) => {
          const { year, month, day } = group.key.created_at!.toTemporalInstant().toZonedDateTimeISO("UTC");

          return {
            day: `${year}-${month}-${day}`,
            value: group.elements.reduce(
              (previous_duration, visit) => previous_duration + Temporal.Duration.from(visit.duration).total("seconds"),
              0,
            ),
            sign_ins: group.elements,
          };
        }),
      ),
  );
