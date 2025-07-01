import { pub } from "@/orpc";
import { LocationStatusShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";
import { LocationName, PartialLocation } from "@packages/types/sign_in";

export const statuses = pub
  .route({ method: "GET", path: "/statuses" })
  .handler(
    async ({ context: { db } }) =>
      Object.fromEntries(
        (await e.select(e.sign_in.Location, LocationStatusShape).run(db)).map((location) => [location.name, location]),
      ) as unknown as { [K in LocationName]: PartialLocation },
  );
