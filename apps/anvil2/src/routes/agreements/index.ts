import { pub } from "@/router";
import { AgreementShape } from "@/utils/queries";
import { CreateAgreementSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { Agreement } from "@ignis/types/root";
import { z } from "zod";
import { get, update } from "./$id";

export const all = pub
  .route({ path: "/agreements" })
  .handler(async ({ context: { db } }) => await e.select(e.sign_in.Agreement, AgreementShape).run(db));

export const create = pub
  .route({ method: "POST", path: "/agreements" })
  .input(
    CreateAgreementSchema.omit({
      _content_hash: true,
      created_at: true,
      updated_at: true,
      version: true,
    }).extend({ reasons: z.array(z.string().uuid()) }),
  )
  .handler(async ({ context: { db }, input }): Promise<Agreement> => {
    const updatedReasons = e.update(e.sign_in.Reason, (reason) => ({
      filter: e.op(reason.id, "in", e.cast(e.uuid, e.set(...input.reasons))),
      set: {
        agreement: e.insert(e.sign_in.Agreement, {
          name: input.name,
          content: input.content,
        }),
      },
    }));
    return await e
      .assert_exists(e.assert_single(e.select(e.op("distinct", updatedReasons.agreement), AgreementShape)))
      .run(db);
  });

export const agreementsRouter = pub.prefix("/agreements").router({
  all,
  create,
  get,
  update,
});
