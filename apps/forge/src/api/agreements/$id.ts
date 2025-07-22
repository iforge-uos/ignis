import { AgreementShape } from "@/lib/utils/queries";
import { auth, pub } from "@/orpc";
import { os } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { UpdateAgreementSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";

export const get = pub
  .route({ path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(
    async ({ input: { id }, context: { db } }) =>
      await e
        .assert_exists(
          e.select(e.sign_in.Agreement, (agreement) => ({
            ...AgreementShape(agreement),
            filter_single: { id },
          })),
        )
        .run(db),
  );

export const update = auth
  .route({ method: "POST", path: "/" })
  .input(
    UpdateAgreementSchema.omit({
      _content_hash: true,
      updated_at: true,
      version: true,
    })
      .partial({ content: true, name: true })
      .extend({ id: z.uuid() }),
  )
  .handler(
    async ({ input, context: { db } }) =>
      await e
        .assert_exists(
          e.select(
            e.update(e.sign_in.Agreement, () => ({
              filter_single: { id: input.id },
              set: { name: input.name, content: input.content },
            })),
            AgreementShape,
          ),
        )
        .run(db),
  );

export const idRouter = os.prefix("/{id}").router({
  get,
  update,
});
