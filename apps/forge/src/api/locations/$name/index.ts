import { FullLocation } from "@/lib/utils/queries";
import { pub, rep } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { Location } from "@packages/types/sign_in";
import * as z from "zod";
import { commonReasons } from "./common-reasons";
import { queueRouter } from "./queue";
import { signInRouter } from "./sign-in";
import { status } from "./status";
import { supervisingReps } from "./supervising-reps";
import { trainingRouter } from "./training";

export const get = rep
  .input(z.object({ name: LocationNameSchema }))
  .route({ path: "/" })
  .handler(
    async ({ input: { name }, context: { db } }): Promise<Location> =>
      await e
        .assert_exists(
          e.select(e.sign_in.Location, (location) => ({
            ...FullLocation(location),
            filter_single: { name },
          })),
        )
        .run(db),
  );

export const nameRoutes = pub.prefix("/{name}").router({
  get,
  commonReasons,
  queue: queueRouter,
  signIn: signInRouter,
  status,
  supervisingReps,
  training: trainingRouter,
});
