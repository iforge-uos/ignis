import { auth } from "@/router";
import { getSignInTrainings } from "@db/queries/getSignInTrainings.query";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { z } from "zod/v4";

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
