import { pub } from "@/orpc";
import { LocationStatusShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
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
