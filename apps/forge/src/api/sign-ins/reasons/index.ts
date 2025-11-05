import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { CreateReasonSchema } from "@packages/db/zod/modules/sign_in";
import { idRouter } from "./$id";

export const all = auth
  .route({ path: "/" })
  .handler(async ({ context: { db } }) => e.select(e.sign_in.Reason, (r) => ({...e.sign_in.Reason["*"], filter: r.active})).run(db));

export const add = auth
  .route({ method: "POST", path: "/" })
  .input(CreateReasonSchema.omit({ created_at: true }))
  .handler(async ({ input: reason, context: { db } }) =>
    e.select(e.insert(e.sign_in.Reason, reason), () => e.sign_in.Reason["*"]).run(db),
  );

export const lastUpdate = auth.route({ path: "/last-update" }).handler(async ({ context: { db } }) =>
  e
    .assert_exists(
      e.assert_single(
        e.select(e.sign_in.Reason, (sign_in) => ({
          order_by: {
            expression: sign_in.created_at,
            direction: e.DESC,
          },
          limit: 1,
        })).created_at,
      ),
    )
    .run(db),
);

export const reasonsRouter = auth.prefix("/reasons").router({
  all,
  lastUpdate,
  ...idRouter,
});
