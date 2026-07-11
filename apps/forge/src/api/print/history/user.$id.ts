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

export const user = printing
  .route({ method: "GET", path: "/user/{id}" })
  .input(z.object({ id: z.uuid(), offset: z.int().nonnegative().default(0) }))
  .output(historyOutput)
  .handler(async ({ input: { id, offset }, context: { db } }) => {
    const history = await e
      .select(e.printing.PrintHistory, (p) => ({
        ...printHistoryShape(p),
        filter: e.op(
          e.op(e.assert_single(p["<history[is printing::Print]"].author.id), "=", e.uuid(id)),
          "and",
          hasLeftQueue(p.status),
        ),
        order_by: { expression: p.created_at, direction: e.DESC },
        limit: QUEUE_RETURN_ITEMS,
        offset,
      }))
      .run(db);
    return toHistoryOutput(history);
  });
