import { rep } from "@/router";
import { CreateInfractionSchema } from "@dbschema/edgedb-zod/modules/users";
import e from "@dbschema/edgeql-js";
import { Duration } from "gel";
import { z } from "zod";

export const addInfraction = rep
  .meta({ method: "POST", path: "/infractions" })
  .input(z.object({ id: z.string().uuid() }).merge(CreateInfractionSchema).omit({ created_at: true }))
  .handler(async ({ input: { id, ...data }, context: { db } }) =>
    e
      .insert(e.users.Infraction, {
        user: e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id } }))),
        ...data,
        duration: data.duration ? Duration.from(data.duration) : undefined,
      })
      .run(db),
  );
