import e from "@packages/db/edgeql-js";
import { TeamShape } from "@/lib/utils/queries";
import { rep } from "@/orpc";
import { get } from "./$id";
import { allAssignable } from "./assignable";
import { search } from "./search";

export const all = rep.handler(async ({ context: { db } }) => await e.select(e.team.Team, TeamShape).run(db));

export const teamsRouter = rep.prefix("/teams").router({ all, allAssignable, get, search });
