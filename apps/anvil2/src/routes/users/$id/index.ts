import { auth, rep } from "@/router";
import { UserShape } from "@/utils/queries";
import { UpdateUserSchema } from "@dbschema/edgedb-zod/modules/users";
import e from "@dbschema/edgeql-js";
import { z } from "zod";
import { signAgreement } from "./agreements.$agreement_id";
import { addInfraction } from "./infractions";
import { trainingRouter } from "./training";

export const get = auth
  .route({ path: "/" })
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e.assert_exists(e.select(e.users.User, (user) => ({ ...UserShape(user), filter_single: { id } }))).run(db),
  );

export const update = auth
  .route({ method: "PATCH", path: "/" })
  .input(
    UpdateUserSchema.omit({
      email: true,
      organisational_unit: true,
      ucard_number: true,
      username: true,
      updated_at: true,
    }).extend({
      id: z.string().uuid(),
    }),
  )
  .handler(async ({ input: { id, ...rest }, context: { db } }) =>
    e.select(e.assert_exists(e.update(e.users.User, () => ({ filter_single: { id }, set: rest }))), UserShape).run(db),
  );

export const idRouter = auth.prefix("/{id}").router({
  training: trainingRouter,
  get,
  update,
  signAgreement,
  addInfraction,
});
