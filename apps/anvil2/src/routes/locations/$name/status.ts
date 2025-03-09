import { pub } from "@/router";
import { LocationStatusShape } from "@/utils/queries";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import type { PartialLocation } from "@ignis/types/sign_in";
import { z } from "zod";

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
