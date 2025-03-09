import { rep } from "@/router";
import { TeamShape } from "@/utils/queries";
import e from "@dbschema/edgeql-js";
import { get } from "./$id";
import { allAssignable } from "./assignable";

export const all = rep.handler(async ({ context: { db } }) => await e.select(e.team.Team, TeamShape).run(db));

export const teamsRouter = rep.prefix("/teams").router({ all, allAssignable, get });
