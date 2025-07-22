import { PartialUserShape } from "@/lib/utils/queries";
import { TeamShape } from "@/lib/utils/queries";
import { rep } from "@/orpc";
import e from "@packages/db/edgeql-js";
import * as z from "zod";

export const get = rep
  .route({ path: "/{id}" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .select(e.team.Team, (team) => ({
        ...TeamShape(team),
        members: PartialUserShape,
        all_members: PartialUserShape,
        filter_single: { id },
      }))
      .run(db),
  );
