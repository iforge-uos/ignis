import { UserShape } from "@/lib/utils/queries";
import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { UpdateUserSchema } from "@packages/db/zod/modules/users";
import * as z from "zod";
import { signAgreement } from "./agreements.$agreement_id";
import { addInfraction } from "./infractions";
import { promote } from "./promote";
import { signIns } from "./sign-ins";
import { trainingRouter } from "./training";
import { profile } from "./profile";

export const get = auth
  .route({ path: "/" })
  .input(z.object({ id: z.uuid() }))
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
      id: z.uuid(),
    }),
  )
  .handler(async ({ input: { id, ...rest }, context: { db } }) =>
    e.select(e.assert_exists(e.update(e.users.User, () => ({ filter_single: { id }, set: rest }))), UserShape).run(db),
  );

export const idRouter = auth.prefix("/{id}").router({
  get,
  update,
  training: trainingRouter,
  signAgreement,
  addInfraction,
  signIns,
  promote,
  profile,
});
