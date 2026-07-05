import { Temporal } from "@js-temporal/polyfill";
import e from "@packages/db/edgeql-js";
import { QueueTypeSchema } from "@packages/db/zod/modules/printing";
import * as z from "zod";
import { adjustLeadTime, durationOut, queueHostCount } from "@/lib/printers/utils";
import { ableToQueuePrint } from "@/orpc";

type QueueType = z.infer<typeof QueueTypeSchema>;

const queued = e.printing.print_status.Queued;

function queuedSet(queue: QueueType, pinned?: boolean) {
  return e.select(e.printing.PrintHistory, (h) => {
    const isQueued = e.op("exists", h.status.is(queued));
    const inQueue = e.op(h.queue, "=", e.cast(e.printing.QueueType, queue));
    let filter = e.op(isQueued, "and", inQueue);
    if (pinned === true) filter = e.op(filter, "and", e.op("exists", h.printer));
    if (pinned === false) filter = e.op(filter, "and", e.op("not", e.op("exists", h.printer)));
    return { filter };
  });
}

function queueStats(queue: QueueType) {
  return e.select({
    items: e.count(queuedSet(queue)),
    lead_pinned: e.sum(queuedSet(queue, true)["<on[is printing::Print]"].duration),
    lead_shared: e.sum(queuedSet(queue, false)["<on[is printing::Print]"].duration),
    hosts: queueHostCount(queue),
  });
}

const queueLengthOutput = z.array(
  z.object({
    queue: QueueTypeSchema,
    items: z.int().nonnegative(),
    lead_time: durationOut,
  }),
);

export const length = ableToQueuePrint
  .route({ method: "GET", path: "/length" })
  .output(queueLengthOutput)
  .handler(async ({ context: { db } }) => {
    const stats = await e
      .select({
        PLA: queueStats("PLA"),
        PETG: queueStats("PETG"),
        TPU: queueStats("TPU"),
        MULTI: queueStats("MULTI"),
      })
      .run(db);

    return QueueTypeSchema.options.map((queue) => {
      const s = stats[queue];
      return {
        queue,
        items: s.items,
        lead_time: adjustLeadTime(s.lead_pinned, s.lead_shared, s.hosts, new Temporal.Duration()),
      };
    });
  });
