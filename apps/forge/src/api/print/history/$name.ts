import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { historyErrors, historyOutput, printHistoryShape, toHistoryOutput } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers } from "@/printing";

export const printer = printing
  .errors(historyErrors)
  .route({ method: "GET", path: "/{name}" })
  .input(z.object({ name: z.string().min(1) }))
  .output(historyOutput)
  .handler(async ({ input: { name }, errors, context: { db } }) => {
    const uuid = printers.get(name)?.id;
    if (!uuid) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    const history = await e
      .select(e.printing.PrintHistory, (p) => ({
        ...printHistoryShape(p),
        filter: e.op(p.printer.id, "=", e.uuid(uuid)),
      }))
      .run(db);
    return toHistoryOutput(history);
  });
