import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { subscribeToDbListener } from "@/db";
import { coalesce, filterAsyncIterator, mergeAsyncIterators } from "@/lib/utils";
import { FullLocation } from "@/lib/utils/queries";
import { pub, rep } from "@/orpc";
import { commonReasons } from "./common-reasons";
import { occupancyForecast } from "./occupancy-forecast";
import { queueRouter } from "./queue";
import { signInRouter } from "./sign-in";
import { HistoricQueue, HistoricSignIns, signInsRouter } from "./sign-ins";
import { status } from "./status";
import { supervisingReps } from "./supervising-reps";
import { toolsRouter } from "./tools";
import { trainingRouter } from "./training";

// These three used to be one fused query. Gel compiled it into SQL that took ~0.5s to *plan* —
// seven times its execution time — and the plan was never reused, leaving a few hundred MB of
// planner scratch behind in every backend that ran it. Three smaller statements plan far more
// cheaply and each gets its own cache entry. `name` is a real parameter rather than an inlined
// literal so both spaces share one plan instead of compiling a statement each.
const LocationQuery = e.params({ name: e.sign_in.LocationName }, ({ name }) =>
  e.assert_exists(
    e.select(e.sign_in.Location, (location) => ({
      ...FullLocation(location),
      filter_single: { name },
    })),
  ),
);
const HistoricSignInsQuery = HistoricSignIns();
const HistoricQueueQuery = HistoricQueue();

export const get = rep
  .input(z.object({ name: LocationNameSchema }))
  .route({ path: "/" })
  .handler(async function* ({ input: { name }, context: { db } }) {
    const getter = async () => {
      const [location, historic_sign_ins, historic_queue] = await Promise.all([
        LocationQuery.run(db, { name }),
        HistoricSignInsQuery.run(db, { name }),
        HistoricQueueQuery.run(db, { name }),
      ]);
      return { ...location, historic_sign_ins, historic_queue };
    };

    yield await getter();

    for await (const _ of coalesce(
      filterAsyncIterator(
        mergeAsyncIterators(subscribeToDbListener("sign_in::SignIn"), subscribeToDbListener("sign_in::QueuePlace")),
        // unlabelled events (deletes) could be either space, so take them rather than miss a sign out
        (event) => event.location === undefined || event.location === name,
      ),
    )) {
      yield await getter();
    }
  });

export const nameRoutes = pub.prefix("/{name}").router({
  get,
  commonReasons,
  tools: toolsRouter,
  occupancyForecast,
  queue: queueRouter,
  signIn: signInRouter,
  signIns: signInsRouter,
  status,
  supervisingReps,
  training: trainingRouter,
});
