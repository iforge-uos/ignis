import { UUID } from "node:crypto";
import { rep, transaction } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { helper, users } from "@packages/db/interfaces";
import { CreateInfractionSchema, RepStatusSchema } from "@packages/db/zod/modules/users";
import { Duration } from "gel";
import { z } from "zod/v4";

// We manually update the __type__ of the underlying users."User" entry in the psql database
// along with this, we must copy all the links from users."User.x" to users."Rep.x".
// as for why we do this. It is so so so much nicer than the alternative of doing this in gel
// (it took 2 rep cycles to figure out how to do this in gel, and then they released full psql support)
export const promote = rep
  .route({ method: "POST", path: "/users/{id}/promote" })
  .input(z.object({ id: z.uuid(), team_ids: z.array(z.uuid()), status: RepStatusSchema }))
  .use(transaction)
  .handler(async ({ input: { id, team_ids, status }, context: { tx } }) => {
    const { direct_links, rep_type_id } = (await e
      .select({
        direct_links: e.select(
          e.select(e.schema.ObjectType, (obj) => ({ filter: e.op(obj.name, "=", "users::User") })).links,
          (link) => ({ filter: e.op(e.op(e.len(link.computed_fields), "=", 0), "and", e.op(link.name, "!=", "__type__")) }),
        ).name,
        rep_type_id: e.assert_exists(e.assert_single(e.users.Rep.__type__.id)),
      })
      .run(tx)) as { direct_links: (keyof helper.Links<users.User>)[]; rep_type_id: UUID };


      await e.insert(
        e.users.Rep, () => ({id, roles: e.select(e.users.Role, (r) => ({filter: e.op(r.name, "in", e.set("Rep", "User"))}))})
      ).run(tx)

    await tx.query(`
    insert ${name} {

    }
    `)
  });
