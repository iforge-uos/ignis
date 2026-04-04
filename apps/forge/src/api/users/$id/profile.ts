import { call, isDefinedError, safe } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { usersRouter as shopUsers } from "@/api/shop/users";
import { InfractionShape, TrainingShape, UserShape } from "@/lib/utils/queries";
import { auth } from "@/orpc";
import { IntegrationShape, resolveIntegrations } from "./integrations";
import { groupSignIns } from "./sign-ins";

const _ALWAYS_TRUE = e.op("exists", 1);

export const get = auth
  .route({ method: "GET", path: "/" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db, ...rest }, errors }) => {
    if (id !== rest.user.id && !rest.user.roles.map(({ name }) => name.toLowerCase()).includes("rep")) {
      throw errors.NOT_FOUND({ message: "User not found" });
    }

    const last3Months = e.shape(e.sign_in.SignIn, (sign_in) => {
      const filter = e.op(
        // @ts-expect-error  // some weird temporal issue I'm sure
        sign_in.created_at,
        ">",
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 3),
      ) as unknown as typeof _ALWAYS_TRUE;
      return {
        filter,
      };
      // should be this but there's a vite(???) issue which turns Duration into a regular object rather than a class
      // (sign_in) => ({ filter: e.op(sign_in.created_at, ">", e.op(e.datetime_of_statement(), "-", Duration.from({months: 3}))) }),
    });

    const frequencies = e.select(e.users.User, (user) => ({
      sign_in_count: e.count(e.select(user.sign_ins, last3Months)),
    })).sign_in_count;

    const dwellers = e.cast(
      e.float64,
      // this returns number[] not number[][] as you might expect for reasons I cannot explain
      e.duration_to_seconds(
        e.select(e.users.User, () => ({
          sign_ins: last3Months,
        })).sign_ins.duration,
      ),
    );

    const lambdaDwellers = e.op(e.op(1, "/", e.math.mean(dwellers)), "if", e.op("exists", dwellers), "else", 1); // https://en.wikipedia.org/wiki/Exponential_distribution
    // we assume this because it makes the maths easier but also cause I plotted it and it seemed like a decent fit

    const user = await e
      .assert_exists(
        e.select(e.users.User, (user) => ({
          ...UserShape(user),
          ...e.is(e.users.Rep, {
            status: true,
            teams: { id: true, name: true, "@created_at": true, "@ends_at": true, "@team_lead": true },
          }),
          training: (t) => {
            const in_person_signed_off_by = e.cast(
              // cursed but required to get around cardinality issues
              e.users.Rep,
              e.assert_single(
                e.select(user.training, (ut) => ({
                  filter_single: { id: t.id },
                  in_person_signed_off_by: ut["@in_person_signed_off_by"],
                })).in_person_signed_off_by,
              ),
            );
            return {
              ...TrainingShape(t),
              icon_url: true,
              in_person_signed_off_by: e.select(in_person_signed_off_by, () => ({
                id: true,
                display_name: true,
              })),
            };
          },
          grouped_sign_ins: e.select(groupSignIns(user.sign_ins)),
          infractions: InfractionShape(user.infractions),
          recent_sign_in_count: e.count(e.select(user.sign_ins, last3Months)),
          dweller: e.op(
            1,
            "-",
            e.math.exp(
              e.op(
                "-",
                e.op(
                  lambdaDwellers,
                  "*",
                  e.cast(e.int64, e.duration_to_seconds(e.sum(e.select(user.sign_ins, last3Months).duration))),
                ),
              ),
            ),
          ),
          frequent_customer: e.op(
            e.op(e.count(e.select(user.sign_ins, last3Months)), ">", e.math.mean(frequencies)),
            "if",
            e.op("exists", frequencies),
            "else",
            false,
          ),
          // streak: e.select(user.sign_ins),
          integrations: IntegrationShape,
          filter_single: { id },
        })),
      )
      .run(db);

    let [integrations, { error: shopError, data: shopInfo }] = await Promise.all([
      resolveIntegrations(user.integrations),
      safe(call(shopUsers.get, { username: user.username }, { context: rest })),
    ]);

    if (shopError && isDefinedError(shopError) && shopError.code === "NOT_FOUND") {
      shopInfo = { balance: 0, cost_centers: [] };
    } else if (shopError) {
      shopInfo = { balance: 0, cost_centers: [] };

      // throw shopError;
    }

    return {
      ...user,
      ...shopInfo,
      integrations,
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
