import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { UCARD_LENGTH } from "@/lib/constants";
import type { BaseKey } from "../$ucard";
import type { Initialise, Receive } from "./_types";

export const StepType = z.enum([
  "AGREEMENTS",
  "CANCEL",
  "FINALISE",
  "INITIALISE",
  "MAILING_LISTS",
  "PERSONAL_TOOLS_AND_MATERIALS",
  "QUEUE",
  "REASON",
  "SIGN_OUT",
  "TOOLS",
]);

export const UCardNumber = z
    .string()
    .regex(new RegExp(`\\d{${UCARD_LENGTH},}`))
    .brand("uCardNumber")
export const InitialiseStep = z.object({
  name: LocationNameSchema,
  ucard_number: UCardNumber,
});

export const createInitialiseStep = <S extends z.infer<typeof StepType>>(type: S) =>
  InitialiseStep.extend({ type: z.literal(type) });

export const createTransmitStep = <S extends z.infer<typeof StepType>>(type: S) =>
  z.object({
    type: z.literal(type),
  });

export const createReceiveStep = <S extends z.infer<typeof StepType>>(type: S) =>
  InitialiseStep.extend({ type: z.literal(type) });

export const createFinaliseStep = <
  CurrentStepT extends z.infer<typeof StepType>,
  NextStepsUnionT extends z.infer<typeof StepType> | undefined,
>(
  type: CurrentStepT,
  next: NextStepsUnionT | z.ZodType<NextStepsUnionT>,
) =>
  z.object({
    type: z.literal(type),
    next: next instanceof z.ZodType ? next : z.literal(next),
  });

type Inner = {
  [KeyT in z.infer<typeof Initialise> as KeyT["type"]]: {
    INITIALISE: Omit<KeyT, "name" | "ucard_number" | "type">;
    RECEIVE: Omit<Extract<z.infer<typeof Receive>, { type: KeyT["type"] }>, "type" | "name">;
  };
};

// defaultdict-esque, used by steps to `finalise` the sign in
export const SIGN_INS = new Proxy(
  {} as {
    [K in BaseKey]: Inner;
  },
  {
    get: (target, name: BaseKey): Inner =>
      name in target
        ? target[name]
        // biome-ignore lint/suspicious/noAssignInExpressions: I should probably globally disable this
        : (target[name] = Object.fromEntries(StepType.options.map((key) => [key, { INITIALISE: {}, RECEIVE: {} }])) as Inner),
  },
);
