import e from "@packages/db/edgeql-js";
import { Agreement } from "@packages/db/edgeql-js/modules/sign_in";
import { CreateAgreementSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { signAgreementParams } from "@/api/users/$id/agreements.$agreement_id";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants";
import { AgreementShape } from "@/lib/utils/queries";
import { getCommonReasons } from "../../common-reasons";
import { createErrorMap, createFinaliseStep, createInitialiseStep, createReceiveStep, createTransmitStep, StepType } from "./_steps";
import type { Params, Return, StepRetry } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.REASON);

export const Transmit = createTransmitStep(StepType.enum.REASON).extend({
  common_reasons: z.custom<Awaited<ReturnType<typeof getCommonReasons>>>(),
});

export const Receive = createReceiveStep(StepType.enum.REASON).extend({
  reason: z.object({ id: z.uuid() }),
  agreement_id: z.uuid().optional(), // set when retrying after the user agreed to an agreement we asked for
});

export const Finalise = createFinaliseStep(
  StepType.enum.REASON,
  z.literal([StepType.enum.TOOLS, StepType.enum.FINALISE, StepType.enum.SUPERVISABLE_TOOLS]),
);

export const Errors = createErrorMap(StepType.enum.REASON, {
  USER_AGREEMENT_NOT_SIGNED: {
    message: "User agreement not signed.",
    status: 400,
    data: CreateAgreementSchema.extend({id: z.uuid()}),
  },
  REASONS_AGREEMENT_NOT_SIGNED: {
    message: "Agreement for inputted reason not signed.",
    status: 400,
    data: z.object({
      reason: z.object({ name: z.string(), id: z.uuid() }),
      agreement: CreateAgreementSchema.extend({id: z.uuid()}),
    }),
  },
  INVALID_AGREEMENT: {
    message: "Agreement signed was not the one requested.",
    status: 400,
    data: z.object({ agreement_id: z.uuid() }),
  },
  INVALID_REASON: {
    status: 400,
    data: z.object({
      reason: z.object({ name: z.string(), id: z.uuid() }),
    }),
  },
} as const);

export default async function* ({
  $user,
  user,
  context: { tx },
  errors,
  input,
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  console.log("In Reason step!!!");
  const userAgreement = e.assert_exists(
    e.select(e.sign_in.Reason, (reason) => ({
      filter_single: e.op(reason.category, "=", e.sign_in.ReasonCategory.PERSONAL_PROJECT),
    })).agreement,
  );

  let rx = yield {
    common_reasons: await getCommonReasons(tx, input.name, user.__typename === "users::Rep"),
  };
  // the agreement we last asked the user to sign, so the client can only sign what we requested
  let requestedAgreementId: string | undefined;

  // loop so a missing agreement can be signed and retried without ending the flow (throwing would close the stream)
  while (true) {
    if (rx.agreement_id) {
      if (rx.agreement_id !== requestedAgreementId) {
        throw errors.INVALID_AGREEMENT({ data: { agreement_id: rx.agreement_id } });
      }
      // sign inside the flow's transaction, a separate connection's write wouldn't be visible to this snapshot
      await signAgreementParams.run(tx, { id: user.id, agreement_id: rx.agreement_id });
    }

    const {
      id,
      name: reasonName,
      agreement,
      category,
    } = await e
      .assert_exists(
        e.select(e.sign_in.Reason, () => ({
          id: true,
          name: true,
          category: true,
          agreement: { ...Agreement["*"], _content_hash: false },
          filter_single: rx.reason,
        })),
      )
      .run(tx);

    if (category === "REP_SIGN_IN" && user.__typename !== "users::Rep") {
      throw errors.INVALID_REASON({
        message: "User signing in is not a rep.",
        data: { reason: { id, name: reasonName } },
      });
    }

    const { signed_user_agreement, signed_reasons_agreement } = await e
      .select($user, () => ({
        // check for the user agreement
        signed_user_agreement: e.op(
          "exists",
          e.select($user.agreements_signed, (a) => ({
            filter_single:
              // path factoring to a["@version_signed"] breaks
              e.op(
                e.op(a.id, "=", userAgreement.id),
                "and",
                e.op($user.agreements_signed["@version_signed"], "=", userAgreement.version),
              ),
          })),
        ),
        // check for the rest of their agreements
        signed_reasons_agreement: agreement
          ? e.op(
              "exists",
              e.select($user.agreements_signed, (a) => ({
                filter_single: e.op(
                  e.op(a.id, "=", e.uuid(agreement.id)),
                  "and",
                  e.op($user.agreements_signed["@version_signed"], "=", agreement.version),
                ),
              })),
            )
          : e.bool(true),
      }))
      .run(tx);

    let retry: StepRetry | undefined;
    if (!signed_user_agreement) {
      const data = await e.select(userAgreement, AgreementShape).run(tx);
      requestedAgreementId = data.id;
      retry = { error: { code: "USER_AGREEMENT_NOT_SIGNED", message: Errors.map.USER_AGREEMENT_NOT_SIGNED.message, data } };
    } else if (!signed_reasons_agreement) {
      requestedAgreementId = agreement!.id;
      retry = {
        error: {
          code: "REASONS_AGREEMENT_NOT_SIGNED",
          message: Errors.map.REASONS_AGREEMENT_NOT_SIGNED.message,
          data: { reason: { id, name: reasonName }, agreement: agreement! },
        },
      };
    }

    if (retry) {
      rx = yield retry;
      continue;
    }

    return route(category, reasonName);
  }
}

function route(category: string, reasonName: string): Omit<z.infer<typeof Finalise>, "type"> {
  if (category === "EVENT") {
    // TODO check required trainings complete associated with event
    return {
      next: StepType.enum.FINALISE,
    };
  }
  if (
    reasonName === REP_ON_SHIFT
    // "exists",
    // e.select($location.queued, (place) => ({ filter: e.op("not", e.op("exists", place.notified_at)) })),
  ) {
    return {
      next: StepType.enum.SUPERVISABLE_TOOLS,
    };
  }
  if (reasonName === REP_OFF_SHIFT) {
    // TODO check has queued e.select($location.queued, (place) => ({ filter: e.op("not", e.op("exists", place.notified_at)) })),
    return {
      next: StepType.enum.SUPERVISABLE_TOOLS,
    };
  }

  return {
    // next: StepType.enum.PERSONAL_TOOLS_AND_MATERIALS,
    next: StepType.enum.TOOLS,
  };
}
