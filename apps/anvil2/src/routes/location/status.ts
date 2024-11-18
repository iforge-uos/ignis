import { EdgeDBService } from "@/services/edgedb.service";
import { publicProcedure } from "@/trpc";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e from "@dbschema/edgeql-js";
import type { PartialLocation } from "@ignis/types/sign_in";

export const status = publicProcedure.input(LocationNameSchema).query(
  async ({ input: name, ctx: { db } }): Promise<PartialLocation> =>
    await e
      .assert_exists(
        e.select(e.sign_in.Location, (loc) => ({
          on_shift_rep_count: true,
          off_shift_rep_count: true,
          user_count: true,
          max: true,
          count_in_queue: loc.queued,
          out_of_hours: true,
          name: true,
          status: true,
          opening_time: loc.opening_time,
          closing_time: loc.closing_time,
          queue_in_use: true,
          filter_single: { name },
        })),
      )
      .run(db),
);
