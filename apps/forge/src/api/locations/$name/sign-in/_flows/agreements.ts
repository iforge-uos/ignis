import { signAgreementParams } from "@/api/users/$id/agreements.$agreement_id";
import e from "@packages/db/edgeql-js";
import { CreateAgreementSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { StepType, createErrorMap, createFinaliseStep, createInitialiseStep, createReceiveStep, createTransmitStep } from "./_steps";
import { type Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.AGREEMENTS);

export const Transmit = createTransmitStep(StepType.enum.AGREEMENTS).extend({
  agreements: z.array(CreateAgreementSchema.extend({ id: z.uuid() })),
});

export const Receive = createReceiveStep(StepType.enum.AGREEMENTS);

export const Finalise = createFinaliseStep(StepType.enum.AGREEMENTS, StepType.enum.MAILING_LISTS);

export const Errors = createErrorMap(StepType.enum.AGREEMENTS, {} as const);

export default async function* ({
  user,
  context: { tx },
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const data = {  // FIXME only get expired ones, remember to dedupe the logic between init and this
    agreements: await e
      .assert_exists(
        e.select(e.sign_in.Agreement, (agreement) => ({
          id: true,
          content: true,
          name: true,
          updated_at: true,
          created_at: true,
          version: true,
          filter: e.op(
            agreement.name,
            "in",
            e.set(...["User Agreement", ...(user.__typename === "users::Rep" ? ["Rep Agreement"] : [])]),
          ),
        })),
      )
      .run(tx),
  };
  yield data;
  if (data.agreements)
    await Promise.all(
      data.agreements.map((agreement) => signAgreementParams.run(tx, { id: user.id, agreement_id: agreement.id })),
    );
  // FIXME this should handle backtracking causing this to fail
  return { next: StepType.enum.MAILING_LISTS };
}
