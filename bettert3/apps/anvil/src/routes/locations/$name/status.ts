import { pub } from "@/router";
import { LocationStatusShape } from "@/utils/queries";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { PartialLocation } from "@packages/types/sign_in";
import { z } from "zod/v4";

export const status = pub
  .input(z.object({ name: LocationNameSchema }))
  .route({ path: "/status" })
  .handler(
    async ({ input: { name }, context: { db } }): Promise<PartialLocation> =>
      e
        .assert_exists(
          e.select(e.sign_in.Location, (location) => ({
            ...LocationStatusShape(location),
            filter_single: { name },
          })),
        )
        .run(db),
  );
