import * as z from "zod";
import e from "@packages/db/edgeql-js";
import { auth } from "@/orpc";
import {
  queueHistoryOutput,
  printsAhead,
  printHistoryShape,
  toHistoryOutput,
  QUEUE_RETURN_ITEMS,
} from "@/lib/printers/utils";

export const prints = auth
  .route({ method: "GET", path: "/prints" })
  .input(
    z.object({
      type: z.enum(["QUEUED", "REVIEW", "HISTORY"]).default("QUEUED"),
      offset: z.int().nonnegative().default(0),
    }),
  )
  .output(queueHistoryOutput)
  .handler(async ({ input: { type, offset }, context: { db, user } }) => {
    const isReview = type === "REVIEW";
    const isHistory = type === "HISTORY";
    const aheadStatus = isReview ? e.printing.print_status.UnderReview : e.printing.print_status.Queued;

    const history = await e
      .select(e.printing.PrintHistory, (p) => {
        const statusFilter = isHistory
          ? e.op(
              e.op("not", e.op("exists", p.status.is(e.printing.print_status.Queued))),
              "and",
              e.op("not", e.op("exists", p.status.is(e.printing.print_status.UnderReview))),
            )
          : e.op("exists", p.status.is(aheadStatus));

        const print = e.assert_exists(e.assert_single(p["<on[is printing::Print]"]));
        const ahead = printsAhead(p.queue, p.created_at, print.priority, aheadStatus);

        const scope = e.op(statusFilter, "and", e.op(p["<on[is printing::Print]"].author.id, "=", e.uuid(user.id)));

        return {
          ...printHistoryShape(p),
          position: isHistory ? e.int64(1) : e.op(e.count(ahead), "+", e.int64(1)),
          lead_time: isHistory ? e.cast(e.duration, e.str("PT0S")) : e.sum(ahead["<on[is printing::Print]"].duration),
          filter: scope,
          order_by: isHistory
            ? [{ expression: p.created_at, direction: e.DESC }]
            : [
                { expression: p["<on[is printing::Print]"].priority, direction: e.DESC },
                { expression: p.created_at, direction: e.ASC },
              ],
          limit: QUEUE_RETURN_ITEMS,
          offset,
        };
      })
      .run(db);

    return toHistoryOutput(history).map((row, i) => ({
      ...row,
      position: history[i]!.position,
      lead_time: history[i]!.lead_time,
    }));
  });
