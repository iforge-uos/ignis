import { rep } from "@/router";
import e from "@dbschema/edgeql-js";
import { z } from "zod";

export const signAgreement = rep
  .input(z.object({ id: z.string().uuid(), agreement_id: z.string().uuid() }))
  .route({ method: "POST", path: "/agreements/{agreement_id}" })
  .handler(async ({ input: { id, agreement_id }, context: { db } }) =>
    e
      .assert_exists(
        e.update(e.users.User, () => ({
          filter_single: { id },
          set: {
            agreements_signed: {
              "+=": e.assert_exists(
                e.select(e.sign_in.Agreement, (agreement) => ({
                  filter_single: { id: agreement_id },
                  version_signed: agreement.version,
                })),
              ),
            },
          },
        })),
      )
      .run(db),
  );
