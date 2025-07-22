import { auth } from "@/orpc";
import { getSignInTrainings } from "@packages/db/queries/getSignInTrainings.query";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";

export const inPersonRemaining = auth
  .route({ path: "/in-person/{location}" })
  .input(
    z.object({
      id: z.uuid(),
      location: LocationNameSchema,
    }),
  )
  .handler(async ({ input: { id, location }, context: { db } }) =>
    getSignInTrainings(db, {
      id,
      name: location,
      name_: location,
    }).then(({ training }) => training.filter((t) => t.selectable.includes("IN_PERSON_MISSING"))),
  );
