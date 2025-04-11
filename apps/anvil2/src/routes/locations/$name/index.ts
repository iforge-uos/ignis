import { rep } from "@/router";
import { PartialUserShape } from "@/utils/queries";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import e from "@db/edgeql-js";
import { Location } from "@ignis/types/sign_in";
import { commonReasons } from "./common-reasons";
import { queueRouter } from "./queue";
import { signInRouter } from "./sign-in";
import { status } from "./status";
import { trainingRouter } from "./training";

export const get = rep
  .input(LocationNameSchema)
  .route({ path: "/" })
  .handler(
    async ({ input: name, context: { db } }): Promise<Location> =>
      await e
        .assert_exists(
          e.select(e.sign_in.Location, () => ({
            ...e.sign_in.Location["*"],
            sign_ins: {
              ...e.sign_in.SignIn["*"],
              reason: e.sign_in.Reason["*"],
              user: (user) => ({
                ...PartialUserShape(user),
                ...e.is(e.users.Rep, {
                  teams: { name: true, description: true, id: true },
                }),
              }),
            },
            queued: {
              ...e.sign_in.QueuePlace["*"],
              user: PartialUserShape,
            },
            filter_single: { name },
          })),
        )
        .run(db),
  );

export const nameRoutes = rep.prefix("/{name}").router({
  get,
  commonReasons,
  queue: queueRouter,
  signIn: signInRouter,
  status,
  training: trainingRouter,
});
