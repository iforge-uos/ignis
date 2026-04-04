import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { subscribeToDbListener } from "@/db";
import { mergeAsyncIterators } from "@/lib/utils";
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
import { user } from "./user";

export const get = rep
  .input(z.object({ name: LocationNameSchema }))
  .route({ path: "/" })
  .handler(async function* ({ input: { name }, context: { db } }) {
    const getter = async () =>
        await e.select(e.sign_in.Location, (location) => ({
          ...FullLocation(location),
          historic_sign_ins: HistoricSignIns()({ name }),
          historic_queue: HistoricQueue()({ name }),
          filter_single: { name },
        }))
      .run(db);

    yield await getter();
    for await (const _ of mergeAsyncIterators(
      subscribeToDbListener("sign_in::SignIn"),
      subscribeToDbListener("sign_in::QueuePlace"),
    )) {
      yield await getter();  // TODO would be nice to half the number of requests going out by checking loc but that's effort
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
  user,
});
