import { z } from "zod";
import type { InputStep as I, StepType } from "./_types";

export const createInputStep = <S extends StepType>(type: S) => z.object({ type: z.literal(type) }); // 1:1
export const InputStep = z.lazy(() => {
  const InputStep: typeof I = require("./_types").InputStep;
  return InputStep;
});
