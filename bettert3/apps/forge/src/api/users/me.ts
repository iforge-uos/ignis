import { auth } from "@/orpc";
import { InfractionShape, RepShape, UserShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";

export const me = auth.route({ method: "GET", path: "/users/@me" }).handler(async ({ context: { db } }) =>
  e
    .select(e.user, (user) => ({
      ...UserShape(user),
      ...e.is(e.users.Rep, RepShape(user)),
      infractions: InfractionShape(user),
    }))
    .run(db),
);
