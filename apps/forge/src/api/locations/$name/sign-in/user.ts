import { getSignInUser } from "@/lib/utils/queries";
import { pub } from "@/orpc";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { UCardNumber } from "./_flows/_steps";

export const user = pub
  .input(z.object({ name: LocationNameSchema, ucard_number: UCardNumber }))
  .route({ path: "/user" })
  .handler(async ({ input: { name, ucard_number }, context: { db } }) => getSignInUser({ name, ucard_number, tx: db }));
