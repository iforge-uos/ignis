import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { historyOutput, printHistoryShape, toHistoryOutput } from "@/lib/printers/utils";
import { auth, ensurePrinters } from "@/orpc";

export const print = auth
  .route({ method: "GET", path: "/print/{id}" })
  .input(z.object({ id: z.uuid().describe("The print's UUID, not the PrintHistory UUID") }))
  .use(async ({ context: { user, db }, next, errors }, input) => {
    const print = await e
      .select(e.printing.Print, () => ({
        author: { id: true },
        filter_single: { id: e.uuid(input.id) },
      }))
      .run(db);
    if (!print) throw errors.NOT_FOUND();
    const isAuthor = user.id === print.author.id;
    const isAdmin = user.roles.some((r) => r.name === "Admin");
    const inTeam = user.__typename === "users::Rep" && user.teams.some((t) => t.name === "3DP");
    if (!(isAuthor || isAdmin || inTeam)) throw errors.FORBIDDEN();
    return next();
  })
  .use(ensurePrinters)
  .output(historyOutput)
  .handler(async ({ input: { id }, context: { db } }) => {
    const history = await e
      .select(e.printing.PrintHistory, (p) => ({
        ...printHistoryShape(p),
        filter: e.op(p["<on[is printing::Print]"].id, "=", e.uuid(id)),
      }))
      .run(db);
    return toHistoryOutput(history);
  });
