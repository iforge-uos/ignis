import { auth } from "@/router";
import { PERSONAL, REP_OFF_SHIFT, REP_ON_SHIFT } from "@/utils/sign-in";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { z } from "zod";

export const commonReasons = auth
  .input(
    z.object({
      name: LocationNameSchema,
      is_rep: z.boolean().optional(),
    }),
  )
  .route({ path: "/common-reasons" })
  .handler(async ({ input: { name, is_rep }, context: { db } }) =>
    e
      .op(
        e.select(e.sign_in.Reason, (reason) => ({
          filter: e.op(reason.name, "in", e.set(...(is_rep ? [REP_ON_SHIFT, REP_OFF_SHIFT] : []), PERSONAL)),
          order_by: e.op(
            // Personal then on then off
            0,
            "if",
            e.op(e.assert_single(reason.name), "=", PERSONAL),
            "else",
            e.op(1, "if", e.op(e.assert_single(reason.name), "=", REP_ON_SHIFT), "else", 2),
          ),
          id: reason.id,
          name: true,
          category: true,
          count: e.select(0),
        })),
        "union",
        e.select(
          e.group(
            e.select(e.sign_in.SignIn, (sign_in) => ({
              filter: e.all(
                e.set(
                  e.op(sign_in.created_at, ">", e.op(e.datetime_current(), "-", e.cal.relative_duration("3d"))),
                  e.op(sign_in.location.name, "=", e.cast(e.sign_in.LocationName, name)),
                  e.op(sign_in.reason.name, "not in", e.set(REP_ON_SHIFT, REP_OFF_SHIFT, PERSONAL)),
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
            id: e.assert_exists(e.assert_single(group.elements.reason.id)),
            count: e.count(group.elements),
            order_by: {
              expression: e.count(group.elements),
              direction: e.DESC,
            },
            limit: is_rep ? 3 : 5,
          }),
        ),
      )
      .run(db),
  );
