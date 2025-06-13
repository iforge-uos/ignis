import { LocationNameSchema } from "@db/zod/modules/sign_in";
import z from "zod/v4";
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
    .regex(/\d{9,}/)
    .brand("uCardNumber"),
});

export const createInitialiseStep = <S extends z.infer<typeof StepType>>(type: S) =>
  InitialiseStep.extend({ type: z.literal(type) });

export const createFinaliseStep = <
  CurrentStepT extends z.infer<typeof StepType>,
  NextStepsUnionT extends z.infer<typeof StepType>,
>(
  type: CurrentStepT,
  next: NextStepsUnionT | z.ZodType<NextStepsUnionT>,
) =>
  z.object({
    type: z.literal(type),
    next: next instanceof z.ZodType ? next : z.literal(next),
  });
