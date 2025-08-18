import { auth } from "@/orpc";
import { searchTeams } from "@packages/db/queries/searchTeams.query";
import z from "zod";

export const search = auth
  .route({ method: "GET", path: "/search" })
  .input(
    z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(5),
    }),
  )
  .handler(async ({ input, context: { db } }) => searchTeams(db, input));
