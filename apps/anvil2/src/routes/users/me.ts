import { auth } from "@/router";
import { InfractionShape, RepShape, UserShape } from "@/utils/queries";
import e from "@dbschema/edgeql-js";

export const me = auth.route({ method: "GET", path: "/users/@me" }).handler(async ({ context: { db } }) =>
  e
    .select(e.user, (user) => ({
      ...UserShape(user),
      ...e.is(e.users.Rep, RepShape(user)),
      infractions: InfractionShape(user),
    }))
    .run(db),
);
