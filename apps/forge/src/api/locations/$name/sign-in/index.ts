import { rep } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import z from "zod";
import { flow, initialise, receive } from "./$ucard";
import { history } from "./history";

/**
 * Instantly sign in as a rep using the space.
 */
export const create = rep
  .route({ path: "/", method: "POST" })
  .input(z.object({ name: LocationNameSchema, reason: z.object({ id: z.uuid() }) }))
  .handler(async ({ input: { name, reason }, context: { db, $user } }) =>
    e
      .insert(e.sign_in.SignIn, {
        user: $user,
        reason: e.assert_exists(e.select(e.sign_in.Reason, () => ({ filter_single: reason }))),
        tools: [],
        location: e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } }))),
      })
      .run(db),
  );

export const signInRouter = rep.prefix("/sign-in").router({
  create,
  history,
  flow,
  initialise,
  receive,
});
