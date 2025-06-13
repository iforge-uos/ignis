import { signAgreement } from "@/routes/users/$id/agreements.$agreement_id";
import e from "@db/edgeql-js";
import { CreateAgreementSchema } from "@db/zod/modules/sign_in";
import { ErrorMap, call } from "@orpc/server";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.AGREEMENTS);

export const Transmit = z.object({
  type: "", /// TODO
  agreement: CreateAgreementSchema.extend({ id: z.uuid() }),
});

export const Receive = z.undefined();

export const Finalise = createFinaliseStep(StepType.enum.AGREEMENTS, StepType.enum.MAILING_LISTS);

export const Errors = {} as const satisfies ErrorMap;

export default async function* ({
  user,
  context: { tx },
}: SignInParams<z.infer<typeof Initialise>>): AsyncGenerator<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const data: z.infer<typeof Transmit> = {
    agreement: await e
      .assert_exists(
        e.select(e.sign_in.Agreement, (agreement) => ({
          id: true,
          content: true,
          name: true,
          updated_at: true,
          created_at: true,
          version: true,
          filter_single: e.op(agreement.name, "=", "User Agreement"),
        })),
      )
      .run(tx),
    type: "AGREEMENTS",
  };
  yield data;
  await call(
    signAgreement,
    { id: user.id, agreement_id: data.agreement.id },
    {
      // this probably isn't perfectly safe but it's good enough
      context: { db: tx } as Parameters<(typeof signAgreement)["~orpc"]["handler"]>[0]["context"] as any,
    },
  );
  return { type: StepType.enum.AGREEMENTS, next: StepType.enum.MAILING_LISTS };
}
