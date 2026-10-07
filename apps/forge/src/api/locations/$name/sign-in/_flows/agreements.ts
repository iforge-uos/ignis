import { signAgreementParams } from "@/api/users/$id/agreements.$agreement_id";
import e from "@packages/db/edgeql-js";
import { CreateAgreementSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import {
  StepType,
  createErrorMap,
  createFinaliseStep,
  createInitialiseStep,
  createReceiveStep,
  createTransmitStep,
} from "./_steps";
import { type Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.AGREEMENTS);

export const Transmit = createTransmitStep(StepType.enum.AGREEMENTS).extend({
  agreements: z.array(CreateAgreementSchema.extend({ id: z.uuid() })),
});

export const Receive = createReceiveStep(StepType.enum.AGREEMENTS);

export const Finalise = createFinaliseStep(StepType.enum.AGREEMENTS, StepType.enum.MAILING_LISTS);

export const Errors = createErrorMap(StepType.enum.AGREEMENTS, {
  // the kiosk has no UI for this step (or MAILING_LISTS) yet, so send them to their own device instead
  AGREEMENTS_NOT_SIGNED: {
    message:
      "User needs to sign the User Agreement first. Ask them to sign it at iforge.sheffield.ac.uk/user/agreements on their own device, then scan again",
    status: 412,
  },
} as const);

export default async function* ({
  user,
  context: { tx },
  errors,
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  throw errors.AGREEMENTS_NOT_SIGNED();
  const data = {
    // FIXME only get expired ones, remember to dedupe the logic between init and this
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
