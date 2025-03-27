import { auth } from "@/router";
import { PartialUserShape } from "@/utils/queries";
import e from "@dbschema/edgeql-js";
import { z } from "zod";

export const get = auth
  .route({ path: "/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .assert_exists(
        e.select(e.sign_in.SignIn, () => ({
          ...e.sign_in.SignIn["*"],
          location: { name: true },
          user: PartialUserShape,
          reason: e.sign_in.Reason["*"],
          duration: true,
          filter_single: { id },
        })),
      )
      .run(db),
  );
