import { REP_ON_SHIFT } from "@/lib/constants";
import { auth } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { Executor } from "gel";
import * as z from "zod";

export const getCommonReasons = async (db: Executor, name: string, is_rep: boolean) => {
  // would be nice if this was e.params and was just a union to avoid the function but
  // error: Can't find materialized set ns~106@ns~107@ns~6@@(__derived__::__withVar_3@w~5).>elements[IS sign_in::SignIn] haunts my dreams

  // TODO consider annual usage as well in this
  const {static_, recent} = await e.select({
    static_: e.select(e.sign_in.Reason, (reason) => ({  // Always returns personal projects / rep on shift then off shift first for the key bindings
      filter: e.op(
        reason.category,
        "=",
        is_rep ? e.sign_in.ReasonCategory.REP_SIGN_IN : e.sign_in.ReasonCategory.PERSONAL_PROJECT,
      ),
      order_by: e.op(
        // Personal then on then off
        0,
        "if",
        e.op(reason.category, "=", e.sign_in.ReasonCategory.PERSONAL_PROJECT),
        "else",
        e.op(1, "if", e.op(reason.name, "=", REP_ON_SHIFT), "else", 2),
      ),
      id_: reason.id,
      name: true,
      category: true,
      count: e.select(0),
    })),
    recent: e.select(
      e.group(
        e.select(e.sign_in.SignIn, (sign_in) => ({
          filter: e.all(
            e.set(
              e.op(sign_in.created_at, ">", e.op(e.datetime_current(), "-", e.cal.relative_duration("3d"))),
              e.op(sign_in.location.name, "=", e.cast(e.sign_in.LocationName, name)),
              e.op(
                sign_in.reason.category,
                "not in",
                e.set(e.sign_in.ReasonCategory.REP_SIGN_IN, e.sign_in.ReasonCategory.PERSONAL_PROJECT),
              ),
            ),
          ),
        })),
        (sign_in) => ({
          by: { reason: sign_in.reason },
        }),
      ),
      (group) => ({
        name: e.assert_exists(e.assert_single(group.elements.reason.name)),
        category: e.assert_exists(e.assert_single(group.elements.reason.category)),
        id_: e.assert_exists(e.assert_single(group.elements.reason.id)),
        count: e.count(group.elements),
        order_by: {
          expression: e.count(group.elements),
          direction: e.DESC,
        },
        limit: is_rep ? 3 : 5,
      }),
    ),
  }).run(db);

  return [...static_, ...recent].map(({ id_, name, category }) => ({ id: id_, name, category }))
};
export const commonReasons = auth // TODO graph this on the admin dashboard over time
  .input(
    z.object({
      name: LocationNameSchema,
      is_rep: z.boolean().default(false),
    }),
  )
  .route({ path: "/common-reasons" })
  .handler(async ({ input, context: { db } }) =>
    getCommonReasons(db, input.name, input.is_rep)
  );
