import Logger from "@/utils/logger";
import { LocationName } from "@ignis/types/sign_in";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createStepSchema } from "./_types";

const Step = createStepSchema("QUEUE");
export const Input = Step.extend({}).and(InputStep);
export const Output = Step.extend({});
export const Errors = {
  AT_CAPACITY: {
    status: 503,
    message: "Failed to sign in, we are at max capacity. Consider using the queue",
  },
} as const satisfies ErrorMap;

export default async function ({
  user,
  input: { name },
  context,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {}

async function getAvailableCapacity(location: LocationName) {
  throw new Error("Function not implemented.");
}

async function queueInUse(location: LocationName) {
  throw new Error("Function not implemented.");
}
function assertHasQueued(name: string, ucard_number: any) {
  throw new Error("Function not implemented.");
}
