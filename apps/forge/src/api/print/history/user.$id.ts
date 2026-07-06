import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { historyOutput, printHistoryShape, toHistoryOutput } from "@/lib/printers/utils";
import { printing } from "@/orpc";

export const user = printing
  .route({ method: "GET", path: "/user/{id}" })
  .input(z.object({ id: z.uuid() }))
  .output(historyOutput)
  .handler(async ({ input: { id }, context: { db } }) => {
    const history = await e
      .select(e.printing.PrintHistory, (p) => ({
        ...printHistoryShape(p),
        filter: e.op(e.assert_single(p["<history[is printing::Print]"].author.id), "=", e.uuid(id)),
      }))
      .run(db);
    return toHistoryOutput(history);
  });
