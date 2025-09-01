import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { auth } from "@/orpc";

const _signIns = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: "" } }))).sign_ins;

export const groupSignIns = (signIns: typeof _signIns) =>
  e.for(
    e.group(signIns, (sign_in) => ({
      by: { created_at: e.datetime_truncate(sign_in.created_at, "days") },
    })),
    (group) =>
      e.select({
        day: e.to_str(group.key.created_at, "YYYY-MM-DD"),
        date: e.cal.to_local_date(group.key.created_at, "Europe/London"),
        value: e.sum(e.duration_to_seconds(group.elements.duration)),
        sign_ins: e.select(group.elements, () => ({
          id: true,
          location: { name: true },
          ends_at: true,
          created_at: true,
          duration: true,
          tools: true,
          reason: { name: true, category: true },
        })),
      }),
  );

export const signIns = auth
  .route({ path: "/sign-ins" })
  .input(z.object({ id: z.uuid() }))
    .handler(async ({ input, context: { db } }) =>
    groupSignIns(e.assert_exists(e.select(e.users.User, () => ({ filter_single: input }))).sign_ins).run(db),
  );
