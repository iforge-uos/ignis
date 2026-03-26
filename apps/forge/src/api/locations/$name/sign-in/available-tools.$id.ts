import { PartialUserShape } from "@/lib/utils/queries";
import { deskOrAdmin } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";

export const availableTools = auth.route({ path: "/available-tools/$id" })
  .input(z.object({ name: LocationNameSchema, id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .update(e.sign_in.SignIn, () => ({
        filter_single: { id },
        set: { ends_at: e.datetime_of_statement() },
      }))
      .run(db),
  );