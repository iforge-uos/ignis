import e from "@packages/db/edgeql-js";
import { CreateReasonSchema } from "@packages/db/zod/modules/sign_in";
import { auth } from "@/orpc";
import { idRouter } from "./$id";
import { subscribeToDbListener } from "/src/db";

export const all = auth
  .route({ path: "/" })
  .handler(async function *({ context: { db } }) {
    const getter = async() => e.select(e.sign_in.Reason, (r) => ({...e.sign_in.Reason["*"], filter: r.active})).run(db)
    yield await getter()
    for await (const reason of subscribeToDbListener("sign_in::Reason")) {
      yield await getter()
    }

  }
);

export const add = auth
  .route({ method: "POST", path: "/" })
  .input(CreateReasonSchema.omit({ created_at: true }))
  .handler(async ({ input: reason, context: { db } }) =>
    e.select(e.insert(e.sign_in.Reason, reason), () => e.sign_in.Reason["*"]).run(db),
  );


export const reasonsRouter = auth.prefix("/reasons").router({
  all,
  ...idRouter,
});
