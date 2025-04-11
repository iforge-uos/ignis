import { auth } from "@/router";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { getSignInTrainings } from "@db/queries/getSignInTrainings.query";
import { z } from "zod";

export const inPersonRemaining = auth
  .route({ path: "/in-person/{location}" })
  .input(
    z.object({
      id: z.string().uuid(),
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
