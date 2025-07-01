import { UCARD_LENGTH } from "@/lib/constants";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import z from "zod/v4";
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
  "REGISTER",
  "SIGN_OUT",
  "TOOLS",
]);

export const InitialiseStep = z.object({
  name: LocationNameSchema,
  ucard_number: z
    .string()
    .regex(new RegExp(`\\d{${UCARD_LENGTH},}`))
    .brand("uCardNumber"),
});

export const createInitialiseStep = <S extends z.infer<typeof StepType>>(type: S) =>
  InitialiseStep.extend({ type: z.literal(type) });

export const createTransmitStep = <S extends z.infer<typeof StepType>>(type: S) =>
  z.object({
    type: z.literal(type),
  });

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

// values used by steps to `finalise` the sign in
export const SIGN_INS: {
  [K in BaseKey]: {
    [KeyT in z.infer<typeof Initialise> as KeyT["type"]]: {
      INITIALISE: Omit<KeyT, "name" | "ucard_number" | "type">;
      RECEIVE: Omit<Extract<z.infer<typeof Receive>, { type: KeyT["type"] }>, "type" | "name">;
    };
  };
} = {};
