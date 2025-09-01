import { call, isDefinedError, safe } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { sign_in } from "@packages/db/interfaces";
import * as gel from "gel";
// import { Duration } from "gel";
import * as z from "zod";
import {usersRouter as shopUsers} from "@/api/shop/users";
import { TrainingShape, UserShape } from "@/lib/utils/queries";
import { auth } from "@/orpc";
import { IntegrationShape, resolveIntegrations } from "./integrations";
import { groupSignIns } from "./sign-ins";

export const get = auth
  .route({ method: "GET", path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db, ...rest } }) => {
    const last3Months = e.shape(
      e.sign_in.SignIn,
      (sign_in) => ({ filter: e.op(sign_in.created_at, ">", new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 3)) }),
      // (sign_in) => ({ filter: e.op(sign_in.created_at, ">", e.op(e.datetime_of_statement(), "-", Duration.from({months: 3}))) }),
    );

    const frequencies = e.select(e.users.User, (user) => ({
      sign_in_count: e.count(e.select(user.sign_ins, last3Months)),
    })).sign_in_count;

    const dwellers = e.cast(
      e.float64,
      // this returns number[] not number[][] as you might except for reasons I cannot explain
      e.duration_to_seconds(
        e.select(e.users.User, () => ({
          sign_ins: last3Months,
        })).sign_ins.duration,
      ),
    );

    const lambdaDwellers = e.op(1, "/", e.math.mean(dwellers)); // https://en.wikipedia.org/wiki/Exponential_distribution
    // we assume this because it makes the maths easier but also cause I plotted it and it seemed like a decent fit

    const user = await e
      .assert_exists(
        e.select(e.users.User, (user) => ({
          ...UserShape(user),
          ...e.is(e.users.Rep, {
            status: true,
            teams: { id: true, name: true, "@created_at": true, "@ends_at": true, "@team_lead": true },
          }),
          training: { ...TrainingShape(user.training), icon_url: true },
          grouped_sign_ins: e.select(groupSignIns(user.sign_ins)),
          recent_sign_in_count: e.count(e.select(user.sign_ins, last3Months)),
          dweller: e.op(
            1,
            "-",
            // e.math.exp(  // soon
            e.op(
              Math.E,
              "^",
              e.op(
                "-",
                e.op(
                  lambdaDwellers,
                  "*",
                  e.sum(e.cast(e.float64, e.duration_to_seconds(e.select(user.sign_ins, last3Months).duration))),
                ),
              ),
            ),
          ),
          frequent_customer: e.op(e.count(e.select(user.sign_ins, last3Months)), ">", e.math.mean(frequencies)),
          streak: e.select(user.sign_ins),
          integrations: IntegrationShape,
          filter_single: { id },
        })),
      )
      .run(db);

    let [integrations, {error: shopError, data: shopInfo}] = await Promise.all([
      resolveIntegrations(user.integrations),
      safe(call(shopUsers.get, {username: user.username}, {context: rest}))
    ])

    if (shopError  && isDefinedError(shopError) && shopError.code === "NOT_FOUND") {
      shopInfo = {balance: 0, cost_centers: []}
    } else if (shopError) {
      throw shopError
    }

    return {
      ...user,
      ...shopInfo,
      integrations,
    } as Omit<typeof user, "grouped_sign_ins"> & typeof shopInfo & {
      grouped_sign_ins: {
        day: string;
        date: gel.LocalDate;
        value: number;
        sign_ins: {
          id: string;
          location: { name: sign_in.LocationName };
          ends_at: Date;
          created_at: Date;
          duration: gel.Duration;
          tools: string[];
          reason: { name: string; category: sign_in.ReasonCategory };
        }[];
      }[];
    };
  });

export const edit = auth
  .route({ method: "PATCH", path: "/" })
  .input(
    z.object({
      id: z.uuid(),
      pronouns: z.string().max(32).optional(),
      display_name: z.string().min(5).max(100).optional(),
    }),
  )
  .handler(async ({ input: { id, ...updates }, context: { db } }) =>
    e
      .assert_exists(
        e.update(e.users.User, () => ({
          filter_single: { id },
          set: updates,
        })),
      )
      .run(db),
  );

export const profileRouter = auth.prefix("/profile").router({
  get,
  edit,
});
