import { auth, pub } from "@/router";
import { AgreementShape } from "@/utils/queries";
import { UpdateAgreementSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { z } from "zod";

export const get = pub
  .route({ path: "/{id}" })
  .input(z.object({ id: z.string().uuid() }))
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
  .input(
    UpdateAgreementSchema.omit({
      _content_hash: true,
      updated_at: true,
      version: true,
    })
      .partial({ content: true, name: true })
      .extend({ id: z.string().uuid() }),
  )
  .route({ method: "POST", path: "/{id}" })
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
