import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { GetSignInToolsReturns, getSignInToolsWithTraining } from "@/lib/utils/sign-in-tools";
import { auth } from "@/orpc";

const IN_PERSON = new Set([
  "DO_IN_PERSON",
  "DO_IN_PERSON_OR_REP_IN_PERSON",
  "DO_IN_PERSON_OR_REP_ONLINE",
  "DO_REP_IN_PERSON",
] as const as GetSignInToolsReturns[number]["selectable"]);

export const inPersonRemaining = auth
  .route({ path: "/in-person/{location}" })
  .input(
    z.object({
      id: z.uuid(),
      location: LocationNameSchema,
    }),
  )
  .handler(async ({ input: { id, location }, context: { db } }) => {
    const tools = await getSignInToolsWithTraining(db, {
      id,
      name: location,
      collapse: true,
    });
    return tools
      .filter((t) => t.selectable.length && new Set(t.selectable).isSubsetOf(IN_PERSON))
      .map(({ training, ...tool }) => ({
        ...tool,
        // the row's own id is the tool's, but sign-off and rep supervision work on training ids
        training_id: training.find((t) => t.next_step === "DO_IN_PERSON")?.id ?? null,
      }));
  });
