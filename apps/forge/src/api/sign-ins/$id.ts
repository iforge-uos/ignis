import { PartialUserShape } from "@/lib/utils/queries";
import { auth, pub } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { UpdateSignInSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";

const SignInShape = e.shape(e.sign_in.SignIn, () => ({
  ...e.sign_in.SignIn["*"],
  location: { name: true },
  user: PartialUserShape,
  reason: e.sign_in.Reason["*"],
  duration: true,
}));

export const get = auth
  .route({ path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .assert_exists(
        e.select(e.sign_in.SignIn, (sign_in) => ({
          ...SignInShape(sign_in),
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
      reason: z.object({ id: z.uuid() }).optional(),
      tools: z.array(z.object({ id: z.uuid() })).optional(),
    }).omit({ ends_at: true }),
  )
  .handler(async ({ input: { id, reason, tools, ...rest }, context: { db } }) =>
    e
      .select(
        e.assert_exists(
          e.update(e.sign_in.SignIn, () => ({
            filter_single: { id },
            set: {
              ...rest,
              reason: reason ? e.cast(e.sign_in.Reason, e.uuid(reason.id)) : undefined,
              tools: tools
                ? e.op(
                    "distinct",
                    e.cast(
                      e.op(e.tools.Tool, "|", e.tools.GroupedTool),
                      e.cast(e.uuid, e.set(...tools.map(({ id }) => id))),
                    ),
                  )
                : undefined,
            },
          })),
        ),
        SignInShape,
      )
      .run(db),
  );

export const out = auth
  .route({ path: "/out", method: "POST" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .update(e.sign_in.SignIn, () => ({
        filter_single: { id },
        set: { ends_at: e.datetime_of_statement() },
      }))
      .run(db),
  );

export const idRouter = pub.prefix("/id").router({
  get,
  update,
  out,
});
