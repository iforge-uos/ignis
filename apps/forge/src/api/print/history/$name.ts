import e from "@packages/db/edgeql-js";
import * as z from "zod";
import {
  hasLeftQueue,
  historyErrors,
  historyOutput,
  printHistoryShape,
  QUEUE_RETURN_ITEMS,
  toHistoryOutput,
} from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers } from "@/printing";

export const printer = printing
  .errors(historyErrors)
  .route({ method: "GET", path: "/{name}" })
  .input(z.object({ name: z.string().min(1), offset: z.int().nonnegative().default(0) }))
  .output(historyOutput)
  .handler(async ({ input: { name, offset }, errors, context: { db } }) => {
    const uuid =
      printers.get(name)?.id ??
      (await e.select(e.printing.Printer, () => ({ id: true, filter_single: { name } })).run(db))?.id;
    if (!uuid) throw errors.PRINTER_NOT_FOUND({ data: { name } });
    const history = await e
      .select(e.printing.PrintHistory, (p) => ({
        ...printHistoryShape(p),
        filter: e.op(e.op(p.printer.id, "=", e.uuid(uuid)), "and", hasLeftQueue(p.status)),
        order_by: { expression: p.created_at, direction: e.DESC },
        limit: QUEUE_RETURN_ITEMS,
        offset,
      }))
      .run(db);
    return toHistoryOutput(history);
  });
