import { deskOrAdmin } from "@/router";
import { PartialUserShape } from "@/utils/queries";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { z } from "zod";

export const history = deskOrAdmin
  .route({ method: "GET", path: "/locations/{name}/sign-in/history" })
  .input(z.object({ name: LocationNameSchema }))
  .handler(async ({ input: { name }, context: { db, logger } }) => {
    logger.info(`Fetching historic sign ins for ${name}`);

    return await e
      .select(e.sign_in.SignIn, (sign_in) => ({
        ...e.sign_in.SignIn["*"],
        user: PartialUserShape,
        reason: e.sign_in.Reason["*"],
        filter: e.op(sign_in.signed_out, "and", e.op(sign_in.location.name, "=", name)),
      }))
      .run(db);
  });
