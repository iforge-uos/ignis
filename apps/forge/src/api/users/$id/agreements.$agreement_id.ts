import { rep } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { z } from "zod/v4";

export const signAgreement = rep
  .route({ method: "POST", path: "/agreements/{agreement_id}" })
  .input(z.object({ id: z.uuid(), agreement_id: z.uuid() }))
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
