import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { historyOutput, printHistoryShape, QUEUE_RETURN_ITEMS, toHistoryOutput } from "@/lib/printers/utils";
import { printing } from "@/orpc";

function escapeLike(query: string): string {
  return query.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export const search = printing
  .route({ method: "GET", path: "/search" })
  .input(
    z.object({
      query: z.string().min(1),
      offset: z.int().nonnegative().default(0),
    }),
  )
  .output(historyOutput)
  .handler(async ({ input: { query, offset }, context: { db } }) => {
    const pattern = `%${escapeLike(query.trim())}%`;
    const history = await e
      .select(e.printing.PrintHistory, (h) => {
        const print = e.assert_exists(e.assert_single(h["<history[is printing::Print]"]));
        const in_queue = e.op(
          e.op("exists", h.status.is(e.printing.print_status.Queued)),
          "or",
          e.op("exists", h.status.is(e.printing.print_status.UnderReview)),
        );
        return {
          ...printHistoryShape(h),
          filter: e.op(in_queue, "and", e.op(print.name, "ilike", pattern)),
          order_by: [
            { expression: e.assert_single(print.priority), direction: e.DESC },
            { expression: h.created_at, direction: e.ASC },
          ],
          limit: QUEUE_RETURN_ITEMS,
          offset,
        };
      })
      .run(db);
    return toHistoryOutput(history);
  });
