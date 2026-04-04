import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { auth, pub } from "@/orpc";
import { availableForUser } from "./available-for-user";

export const all = pub
  .input(z.object({ name: LocationNameSchema }))
  .route({ method: "GET", path: "/" })
  .handler(async ({ input: { name }, context: { db } }) =>
    e
      .assert_exists(
        e.select(e.tools.Tool, (tool) => ({
          filter: e.op(tool.location.name, "=", e.cast(e.sign_in.LocationName, name)),
          name: true,
          quantity: true,
          borrowable: true,
          is_bookable: true,
          description: true,
          location: {
            name: true,
          },
          training: {
            name: true,
            icon_url: true,
            id: true,
            limit: 1,
          },
          use_count: e.count(
            e.select(tool.location.sign_ins, (sign_in) => ({
              filter: e.op(tool, "in", sign_in._tools),
            })),
          ),
        })),
      )
      .run(db),
  );

export const toolsRouter = pub.prefix("/tools").router({
  all,
  availableForUser,
});