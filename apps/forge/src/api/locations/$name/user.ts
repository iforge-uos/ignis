import { getSignInUser } from "/src/lib/utils/queries";
import { pub } from "@/orpc";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { UCardNumber } from "./sign-in/_flows/_steps";

export const user = pub
  .input(z.object({ name: LocationNameSchema, ucard_number: UCardNumber }))
  .route({ path: "/user" })
  .handler(
    async ({ input: { name, ucard_number }, context: { db } }) =>
      await getSignInUser({name, ucard_number, tx: db})
  );
