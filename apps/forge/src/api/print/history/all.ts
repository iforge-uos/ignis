import e from "@packages/db/edgeql-js";
import * as z from "zod";
import {
  hasLeftQueue,
  historyOutput,
  printHistoryShape,
  QUEUE_RETURN_ITEMS,
  toHistoryOutput,
} from "@/lib/printers/utils";
import { printing } from "@/orpc";

export const all = printing
  .route({ method: "GET", path: "/all" })
  .input(z.object({ offset: z.int().nonnegative().default(0) }).default({ offset: 0 }))
  .output(historyOutput)
  .handler(async ({ input: { offset }, context: { db } }) => {
    const history = await e
      .select(e.printing.PrintHistory, (p) => ({
        ...printHistoryShape(p),
        filter: hasLeftQueue(p.status),
        order_by: { expression: p.created_at, direction: e.DESC },
        limit: QUEUE_RETURN_ITEMS,
        offset,
      }))
      .run(db);
    return toHistoryOutput(history);
  });
