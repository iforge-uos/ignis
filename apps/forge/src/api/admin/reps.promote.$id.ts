import { admin } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { Duration } from "gel";
import { z } from "zod";

export const promote = admin
  .route({ method: "POST", path: "/reps/promote/{id}" })
  .input(
    z.object({
      id: z.uuid(),
      team_id: z.uuid(),
    }),
  )
  .handler(
    async ({ input: { id, team_id }, context: { db } }) =>
      e
        .select(
          e.update(e.users.Rep, (rep) => ({
            set: {
              teams: e.select(rep.teams, (team) => ({
                "@team_lead": e.tuple({
                  created_at: e.op(
                    team["@team_lead"].created_at,
                    "if",
                    e.op("exists", team["@team_lead"]),
                    "else",
                    e.datetime_of_transaction(),
                  ),
                  // ends_at: e.op(e.datetime_of_transaction(), "+", Duration.from({ years: 1 })),
                  ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                }),
                "@ends_at": e.op(
                  team["@ends_at"],
                  "if",
                  e.op(team.id, "=", e.uuid(team_id)),
                  "else",
                  e.datetime_of_transaction(),
                ),
                "@created_at": team["@created_at"],
              })),
            },
            filter_single: { id },
          })),
        )
        .run(db),
    // TODO RPC into discord bot
  );
