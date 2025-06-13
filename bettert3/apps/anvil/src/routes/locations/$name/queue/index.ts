import { auth } from "@/router";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { z } from "zod/v4";
import { SignInErrors } from "../sign-in/_flows/_types";
import queue from "../sign-in/_flows/queue";
import { remove } from "./$id";

export const add = auth
  .route({
    method: "POST",
    path: "/",
  })
  .errors(SignInErrors)
  .input(
    z.object({
      name: LocationNameSchema,
    }),
  )
  .handler(async ({ input: { name }, context, errors }) => {
    const $location = e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } })));
    return await queue({
      $user: e.user as any, // TODO figure out how to remove the any
      $location,
      errors,
      context: { ...context, tx: context.db },
      input: { name, type: "QUEUE", ucard_number: "" },
    }).next()
  });

export const queueRouter = auth.prefix("/queue").router({
  add,
  remove,
});
