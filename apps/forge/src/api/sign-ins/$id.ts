import { PartialUserShape } from "@/lib/utils/queries";
import { auth, pub } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { UpdateSignInSchema } from "@packages/db/zod/modules/sign_in";
import { z } from "zod/v4";

export const get = auth
  .route({ path: "/" })
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

export const update = auth
  .route({ method: "PATCH", path: "/" })
  .input(
    UpdateSignInSchema.extend({
      id: z.uuid(),
    }).omit({ ends_at: true }),
  )
  .handler(async ({ input: { id, ...rest }, context: { db } }) =>
    e
      .select(
        e.assert_exists(
          e.update(e.sign_in.SignIn, () => ({
            filter_single: { id },
            set: { ...rest, ends_at: new Date() },
          })),
        ),
        () => ({
          ...e.sign_in.SignIn["*"],
          location: { name: true },
          user: PartialUserShape,
          reason: e.sign_in.Reason["*"],
          duration: true,
        }),
      )
      .run(db),
  );

export const idRouter = pub.prefix("/id").router({
  get,
  update,
});
