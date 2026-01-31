import { auth } from "@/orpc";
import { getSignInTools, GetSignInToolsReturns } from "@packages/db/queries/getSignInTools.query";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";

const IN_PERSON = new Set( ["DO_IN_PERSON", "DO_IN_PERSON_OR_REP_IN_PERSON", "DO_IN_PERSON_OR_REP_ONLINE", "DO_REP_IN_PERSON"] as const as GetSignInToolsReturns[number]["selectable"]);

export const inPersonRemaining = auth
  .route({ path: "/in-person/{location}" })
  .input(
    z.object({
      id: z.uuid(),
      location: LocationNameSchema,
    }),
  )
  .handler(async ({ input: { id, location }, context: { db } }) =>
    getSignInTools(db, {
      id,
      name: location,
    }).then((tools) => tools.filter((t) => IN_PERSON.isSubsetOf(new Set(t.selectable)))),
  );
