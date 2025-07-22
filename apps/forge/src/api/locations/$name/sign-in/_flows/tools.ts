import { ErrorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { tools } from "@packages/db/interfaces";
import { getSignInTrainings } from "@packages/db/queries/getSignInTrainings.query";
import * as z from "zod";
import { StepType, createFinaliseStep, createInitialiseStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.TOOLS);

export const Transmit = createTransmitStep(StepType.enum.TOOLS).extend({
  tools: z.custom<Awaited<ReturnType<typeof getSignInTrainings>>["training"]>(),
});

export const Receive = z.object({
  type: z.literal(StepType.enum.TOOLS),
  tools: z.array(z.object({ id: z.uuid() })),
});

export const Finalise = createFinaliseStep(StepType.enum.TOOLS, StepType.enum.FINALISE);

export const Errors = {} as const satisfies ErrorMap;

export default async function* ({
  user: { id },
  input: { name },
  context: { tx },
  $location,
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const { training } = await getSignInTrainings(tx, { id, name, name_: name });

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
      selectable: e.array(["UNTRAINED" satisfies tools.Selectability]),
      filter: e.all(
        e.set(
          e.op(training_.id, "not in", e.cast(e.uuid, e.set(...training.map((training) => training.id)))),
          e.op("exists", training_.rep),
          e.op($location, "in", training_.locations),
          training_.enabled,
        ),
      ),
    }))
    .run(tx)) as typeof training;

  const selected = yield { tools: [...training, ...all_training] };
  // TODO check if booked and selectable?

  return {
    next: StepType.enum.FINALISE,
  };
}
