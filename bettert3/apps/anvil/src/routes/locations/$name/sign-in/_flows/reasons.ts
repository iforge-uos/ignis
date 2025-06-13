import { AgreementShape } from "@/utils/queries";
import e from "@db/edgeql-js";
import { Agreement } from "@db/edgeql-js/modules/sign_in";
import { training } from "@db/interfaces";
import { getSignInTrainings } from "@db/queries/getSignInTrainings.query";
import { CreateAgreementSchema } from "@db/zod/modules/sign_in";
import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.REASON);

export const Transmit = z.object({ type: z.literal(StepType.enum.REASON) });

export const Receive = z.object({ type: z.literal(StepType.enum.REASON), reason: z.object({ id: z.uuid() }) });

export const Finalise = createFinaliseStep(
  StepType.enum.REASON,
  z.union([z.literal(StepType.enum.TOOLS), z.literal(StepType.enum.FINALISE)])).extend(
  {
    rep_sign_in_dequeuing: z.boolean().optional(),
    training: z.array(z.any()).optional(), // Consider defining a more specific schema for training items
  },
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
} as const satisfies ErrorMap;

export default async function* ({
  $user,
  $location,
  input: { name: location },
  context: { tx },
  errors,
}: SignInParams<z.infer<typeof Initialise>>): AsyncGenerator<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const userAgreement = e.assert_exists(
    e.select(e.sign_in.Reason, (reason) => ({
      filter_single: e.op(reason.category, "=", e.sign_in.ReasonCategory.PERSONAL_PROJECT),
    })).agreement,
  );

  const { reason } = yield { type: StepType.enum.REASON };

  const {
    id,
    name: reason_name,
    agreement,
  } = await e
    .assert_exists(
      e.select(e.sign_in.Reason, () => ({
        id: true,
        name: true,
        agreement: { ...Agreement["*"], _content_hash: false },
        filter_single: reason,
      })),
    )
    .run(tx);

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
    throw errors.REASONS_AGREEMENT_NOT_SIGNED({ data: { reason: { id, name: reason_name }, agreement: agreement! } });
  }

  if (reason_name === "Event") {
    return {
      type: StepType.enum.REASON,
      next: StepType.enum.TOOLS,
    };
  }

  const { training } = await getSignInTrainings(tx, { id, name: location, name_: location });

  const all_training = (await e
    .select(e.training.Training, (training_) => ({
      id: true,
      name: true,
      compulsory: true,
      in_person: true,
      rep: { id: true, description: true },
      description: true,
      enabled: true,
      icon_url: true,
      selectable: e.array(["NO_TRAINING" satisfies training.Selectability]),
      filter: e.all(
        e.set(
          e.op(training_.id, "not in", e.cast(e.uuid, e.set(...training.map((training) => training.id)))),
          e.op("exists", training_.rep),
          e.op(location, "in", training_.locations),
          training_.enabled,
        ),
      ),
    }))
    .run(tx)) as typeof training;

  // return [...training, ...all_training];

  return {
    type: StepType.enum.REASON,
    next: StepType.enum.TOOLS,
    rep_sign_in_dequeuing:
      reason_name === "Rep On Shift" &&
      (await e
        .op(
          "exists",
          e.select($location.queued, (place) => ({ filter: e.op("not", e.op("exists", place.notified_at)) })),
        )
        .run(tx)),
    training: [...training, ...all_training],
  };
}
