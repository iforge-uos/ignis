import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { historyOutput, printHistoryShape, toHistoryOutput } from "@/lib/printers/utils";
import { auth, ensurePrinters } from "@/orpc";

export const user = auth
  .route({ method: "GET", path: "/user/{id}" })
  .input(z.object({ id: z.uuid() }))
  .use(({ context: { user }, next, errors }, input) => {
    if (user.id === input.id) return next();
    const isAdmin = user.roles.some((r) => r.name === "Admin");
    const inTeam = user.__typename === "users::Rep" && user.teams.some((t) => t.name === "3DP");
    if (!(isAdmin || inTeam)) throw errors.FORBIDDEN();
    return next();
  })
  .use(ensurePrinters)
  .output(historyOutput)
  .handler(async ({ input: { id }, context: { db } }) => {
    const history = await e
      .select(e.printing.PrintHistory, (p) => ({
        ...printHistoryShape(p),
        filter: e.op(p["<on[is printing::Print]"].author.id, "=", e.uuid(id)),
      }))
      .run(db);
    return toHistoryOutput(history);
  });
