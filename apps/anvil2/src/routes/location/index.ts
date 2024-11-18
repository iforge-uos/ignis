import { EdgeDBService } from "@/services/edgedb.service";
import { deskProcedure, publicProcedure, router } from "@/trpc";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import { Location } from "@ignis/types/sign_in";

export const PartialUserProps = e.shape(e.users.User, () => ({
  // Fairly minimal, useful for templating
  id: true,
  pronouns: true,
  email: true,
  display_name: true,
  username: true,
  ucard_number: true,
  profile_picture: true,
  created_at: true,
  roles: { id: true, name: true },
}));

export const get = deskProcedure
  .input(LocationNameSchema)
  .query(async ({ input: name, ctx: { db } }): Promise<Location> => {
    return await e
      .assert_exists(
        e.select(e.sign_in.Location, () => ({
          ...e.sign_in.Location["*"],
          sign_ins: {
            ...e.sign_in.SignIn["*"],
            reason: e.sign_in.Reason["*"],
            user: (user) => ({
              ...PartialUserProps(user),
              ...e.is(e.users.Rep, {
                teams: { name: true, description: true, id: true },
              }),
            }),
          },
          queued: {
            ...e.sign_in.QueuePlace["*"],
            user: PartialUserProps,
          },
          filter_single: { name },
        })),
      )
      .run(db);
  });

export const signInRouter = router({
  get,
});
