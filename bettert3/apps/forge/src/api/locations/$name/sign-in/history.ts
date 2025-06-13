import { deskOrAdmin } from "@/orpc";
import { PartialUserShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { z } from "zod/v4";

export const history = deskOrAdmin
  .route({ path: "/history" })
  .input(z.object({ name: LocationNameSchema, limit: z.number().min(1).default(100), offset: z.number().min(0).default(0) }))
  .handler(async ({ input: { name, limit, offset }, context: { db } }) =>
    e
      .select(e.sign_in.SignIn, (sign_in) => ({
        ...e.sign_in.SignIn["*"],
        user: PartialUserShape,
        reason: e.sign_in.Reason["*"],
        filter: e.op(sign_in.signed_out, "and", e.op(sign_in.location.name, "=", name)),
        limit,
        offset,
        order_by: sign_in.created_at,
      }))
      .run(db),
  );
