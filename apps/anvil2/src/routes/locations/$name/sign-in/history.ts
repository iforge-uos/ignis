import { deskOrAdmin } from "@/router";
import { PartialUserShape } from "@/utils/queries";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { z } from "zod/v4";

export const history = deskOrAdmin
  .route({ path: "/history" })
  .input(z.object({ name: LocationNameSchema }))
  .handler(async ({ input: { name }, context: { db } }) =>
    e
      .select(e.sign_in.SignIn, (sign_in) => ({
        ...e.sign_in.SignIn["*"],
        user: PartialUserShape,
        reason: e.sign_in.Reason["*"],
        filter: e.op(sign_in.signed_out, "and", e.op(sign_in.location.name, "=", name)),
      }))
      .run(db),
  );
