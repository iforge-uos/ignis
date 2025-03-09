import { UUID } from "node:crypto";
import { repProcedure } from "@/router";
import { CreateInfractionSchema, RepStatusSchema } from "@dbschema/edgedb-zod/modules/users";
import e from "@dbschema/edgeql-js";
import { helper, users } from "@dbschema/interfaces";
import { Duration } from "gel";
import { z } from "zod";

// We manually update the __type__ of the underlying users."User" entry in the psql database
// along with this, we must copy all the links from users."User.x" to users."Rep.x".
// as for why we do this. It is so so so much nicer than the alternative of doing this in gel
// (it took 2 rep cycles to figure out how to do this in gel, and then they released full psql support)
export const promote = repProcedure
  .meta({ openapi: { method: "POST", path: "/users/{id}/promote", protect: true } })
  .input(z.object({ id: z.string().uuid(), team_ids: z.array(z.string().uuid()), status: RepStatusSchema }))
  .handler(async ({ input: { id, team_ids, status }, context: { db, logger } }) => {
    const { links, rep_type_id } = (await e
      .select({
        links: e.select(e.schema.ObjectType, (obj) => ({ filter: e.op(obj.name, "=", "users::User") })).links.name,
        rep_type_id: e.assert_exists(e.assert_single(e.users.Rep.__type__.id)),
      })
      .run(db)) as { links: (keyof helper.Links<users.User>)[]; rep_type_id: UUID };
    // run in tx for hopefully obvious reasons
    `\
WITH updated_user AS (
  UPDATE "user"."User"
  SET "__type__" = "b9bc162a-e699-11ef-9a21-61a2d682ced2"
  WHERE id = "69319fa8-e69a-11ef-9666-a3051bb1f95a"
  RETURNING *
)
INSERT INTO "user"."Rep" (
  id,
  "__type__"
)
SELECT
  updated_user.id,
  updated_user.__type__
FROM updated_user;
`;
  });
