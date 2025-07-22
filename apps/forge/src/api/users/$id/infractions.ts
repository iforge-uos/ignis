import { rep } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { CreateInfractionSchema } from "@packages/db/zod/modules/users";
import * as z from "zod";

export const addInfraction = rep
  .route({ method: "POST", path: "/infractions", tags: ["hidden"] })
  .input(z.object({ id: z.uuid() }).and(CreateInfractionSchema.omit({ created_at: true })))
  .handler(async ({ input: { id, ...data }, context: { db } }) =>
    e
      .insert(e.users.Infraction, {
        user: e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id } }))),
        ...data,
      })
      .run(db),
  );
