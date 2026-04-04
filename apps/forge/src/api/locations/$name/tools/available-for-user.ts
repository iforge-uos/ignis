import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { rep } from "@/orpc";
import { getSignInTools } from "@packages/db/queries/getSignInTools.query";

export const availableForUser = rep
  .input(z.object({ name: LocationNameSchema, user_id: z.uuid() }))
  .route({ method: "GET", path: "/{user_id}" })
  .handler(async ({ input: { name, user_id }, context: { db } }) => getSignInTools(db, { name, id: user_id }));