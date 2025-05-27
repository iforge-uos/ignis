import { auth } from "@/router";
import { PartialUserShape } from "@/utils/queries";
import e from "@db/edgeql-js";
import { z } from "zod/v4";

export const get = auth
  .route({ path: "/{id}" })
  .input(z.object({ id: z.uuid() }))
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
