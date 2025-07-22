import { REP_ON_SHIFT } from "@/lib/constants";
import { AgreementShape } from "@/lib/utils/queries";
import { ErrorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { Agreement } from "@packages/db/edgeql-js/modules/sign_in";
import { CreateAgreementSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { StepType, createFinaliseStep, createInitialiseStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.REASON);

export const Transmit = createTransmitStep(StepType.enum.REASON);

export const Receive = z.object({ type: z.literal(StepType.enum.REASON), reason: z.object({ id: z.uuid() }) });

export const Finalise = createFinaliseStep(
  StepType.enum.REASON,
  z.literal([StepType.enum.TOOLS, StepType.enum.FINALISE]),
);

export const Errors = {
  USER_AGREEMENT_NOT_SIGNED: {
    message: "User agreement not signed.",
    status: 400,
    data: CreateAgreementSchema,
  },
  REASONS_AGREEMENT_NOT_SIGNED: {
    message: "Agreement for inputted reason not signed.",
    status: 400,
    data: z.object({
      reason: z.object({ name: z.string(), id: z.uuid() }),
      agreement: CreateAgreementSchema,
    }),
  },
  INVALID_REASON: {
    status: 400,
    data: z.object({
      reason: z.object({ name: z.string(), id: z.uuid() }),
    }),
  },
} as const satisfies ErrorMap;

export default async function* ({
  $user,
  user,
  context: { tx },
  errors,
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const userAgreement = e.assert_exists(
    e.select(e.sign_in.Reason, (reason) => ({
      filter_single: e.op(reason.category, "=", e.sign_in.ReasonCategory.PERSONAL_PROJECT),
    })).agreement,
  );

  const { reason } = yield {};

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
        filter_single: reason,
      })),
    )
    .run(tx);

  if (category === "REP_SIGN_IN" && !user.is_rep) {
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
          filter_single: e.op(
            e.op(a.id, "=", userAgreement.id),
            "and",
            e.op(a["@version_signed"], "=", userAgreement.version),
          ),
        })),
      ),
      // check for the rest of their agreements
      signed_reasons_agreement: agreement
        ? e.op(
            "exists",
            e.select($user.agreements_signed, (a) => ({
              filter_single: e.op(
                e.op(a.id, "=", agreement.id),
                "and",
                e.op(a["@version_signed"], "=", agreement.version),
              ),
            })),
          )
        : e.bool(true),
    }))
    .run(tx);

  if (!signed_user_agreement) {
    throw errors.USER_AGREEMENT_NOT_SIGNED({ data: await e.select(userAgreement, AgreementShape).run(tx) });
  }
  if (!signed_reasons_agreement) {
    throw errors.REASONS_AGREEMENT_NOT_SIGNED({ data: { reason: { id, name: reasonName }, agreement: agreement! } });
  }

  if (category === "EVENT") {
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
      next: StepType.enum.FINALISE,
    };
  }

  return {
    next: StepType.enum.TOOLS,
  };
}
