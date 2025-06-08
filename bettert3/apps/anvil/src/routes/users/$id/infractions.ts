import { rep } from "@/router";
import e from "@db/edgeql-js";
import { CreateInfractionSchema } from "@db/zod/modules/users";
import { z } from "zod/v4";

export const addInfraction = rep
  .route({ method: "POST", path: "/infractions" })
  .input(z.object({ id: z.uuid() }).and(CreateInfractionSchema.omit({ created_at: true })))
  .handler(async ({ input: { id, ...data }, context: { db } }) =>
    e
      .insert(e.users.Infraction, {
        user: e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id } }))),
        ...data,
      })
      .run(db),
  );
