import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { z } from "zod/v4";
import { Errors } from "../sign-in/_flows/_types";
import queue, { Finalise } from "../sign-in/_flows/queue";
import { remove } from "./$id";

export const add = auth
  .route({
    method: "POST",
    path: "/",
  })
  .errors(Errors)
  .input(
    z.object({
      name: LocationNameSchema,
    }),
  )
  .handler(async ({ input: { name }, context, errors }) => {
    const $location = e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } })));
    const tx = queue({
      $user: context.$user,
      $location,
      errors,
      context: { ...context, tx: context.db },
      input: { name, type: "QUEUE", ucard_number: "" as any },
    }).next;
    await tx(); // should be the transmit AKA useless
    const { value } = (await tx()) as { value: z.infer<typeof Finalise> }; // should be the finalise
    return value.place;
  });

export const queueRouter = auth.prefix("/queue").router({
  add,
  remove,
});
