import { signAgreement } from "@/api/users/$id/agreements.$agreement_id";
import { ErrorMap, call } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { CreateAgreementSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { StepType, createFinaliseStep, createInitialiseStep, createReceiveStep, createTransmitStep } from "./_steps";
import { type Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.AGREEMENTS);

export const Transmit = createTransmitStep(StepType.enum.AGREEMENTS).extend({
  agreements: z.array(CreateAgreementSchema.extend({ id: z.uuid() })),
});

export const Receive = createReceiveStep(StepType.enum.AGREEMENTS)

export const Finalise = createFinaliseStep(StepType.enum.AGREEMENTS, StepType.enum.MAILING_LISTS);

export const Errors = {} as const satisfies ErrorMap;

export default async function* ({
  user,
  context: { tx },
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const data = {
    agreements: await e
      .assert_exists(
        e.select(e.sign_in.Agreement, (agreement) => ({
          id: true,
          content: true,
          name: true,
          updated_at: true,
          created_at: true,
          version: true,
          filter: e.op(agreement.name, "=", "User Agreement"), // TODO add rep agreement as well
        })),
      )
      .run(tx),
  };
  yield data;
  for (const agreement of data.agreements) {
    // FIXME this should handle backtracking causing this to fail
    await call(
      signAgreement,
      { id: user.id, agreement_id: agreement.id },
      {
        // this probably isn't perfectly safe but it's good enough
        context: { db: tx, user } as Parameters<(typeof signAgreement)["~orpc"]["handler"]>[0]["context"] as any,
      },
    );
  }
  return { next: StepType.enum.MAILING_LISTS };
}
