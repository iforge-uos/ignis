import { rep } from "@/orpc";
import { TeamShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";

export const allAssignable = rep.route({ path: "/assignable" }).handler(async ({ context: { db } }) => {
  const unassignableTeams = e.set("Staff", "?");
  return await e
    .select(e.team.Team, (team) => ({
      ...TeamShape(team),
      filter: e.op(team.name, "not in", unassignableTeams),
    }))
    .run(db);
});
