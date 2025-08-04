import { InfractionShape, RepShape, UserShape } from "@/lib/utils/queries";
import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";

export const me = auth.route({ method: "GET", path: "/@me" }).handler(async ({ context: { db, $user } }) =>
  e
    .select($user, (user) => ({
      ...UserShape(user),
      ...e.is(e.users.Rep, RepShape(user)),
      infractions: InfractionShape(user),
    }))
    .run(db)
);