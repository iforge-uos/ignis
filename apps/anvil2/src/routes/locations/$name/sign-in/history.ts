import { deskOrAdmin } from "@/router";
import { PartialUserShape } from "@/utils/queries";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { z } from "zod";

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
