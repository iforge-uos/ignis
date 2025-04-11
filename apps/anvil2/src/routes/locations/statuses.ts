import { pub } from "@/router";
import { LocationStatusShape } from "@/utils/queries";
import e from "@db/edgeql-js";
import { LocationName, PartialLocation } from "@ignis/types/sign_in";

export const statuses = pub
  .route({ method: "GET", path: "/statuses" })
  .handler(
    async ({ context: { db } }) =>
      Object.fromEntries(
        (await e.select(e.sign_in.Location, LocationStatusShape).run(db)).map((location) => [location.name, location]),
      ) as unknown as { [K in LocationName]: PartialLocation },
  );
