import { pub } from "@/router";
import { LocationStatusShape } from "@/utils/queries";
import e from "@dbschema/edgeql-js";
import { LocationName, PartialLocation } from "@ignis/types/sign_in";

export const statuses = pub
  .route({ method: "GET", path: "/locations/statuses" })
  .handler(async ({ context: { db } }) => {
    return Object.fromEntries(
      (await e.select(e.sign_in.Location, LocationStatusShape).run(db)).map((location) => [location.name, location]),
    ) as unknown as { [K in LocationName]: PartialLocation };
  });
