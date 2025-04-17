import { rep } from "@/router";
import { PartialUserShape } from "@/utils/queries";
import { TeamShape } from "@/utils/queries";
import e from "@db/edgeql-js";
import { z } from "zod";

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
