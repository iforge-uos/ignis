import { rep, auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import * as z from "zod";

export const signAgreementParams = e.params({ id: e.uuid, agreement_id: e.uuid }, ({ id, agreement_id }) =>
  e.assert_exists(
    e.update(e.users.User, () => ({
      filter_single: { id },
      set: {
        agreements_signed: {
          "+=": e.select(e.cast(e.sign_in.Agreement, agreement_id), (agreement) => ({
            "@version_signed": agreement.version,
          })),
        },
      },
    })),
  ),
);

export const signAgreement = auth
  .route({ method: "POST", path: "/agreements/{agreement_id}" })
  .input(z.object({ id: z.uuid(), agreement_id: z.uuid() }))
  .handler(async ({ input, context: { db, user } }) => {
    if (user.id !== id) throw new Error("Trying to sign an agreement for somebody else");
    return await signAgreementParams.run(db, input)
  });
