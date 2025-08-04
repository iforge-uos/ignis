import { TrainingForLocationShape } from "@/lib/utils/queries";
import { pub } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/training";
import * as z from "zod";

export const all = pub
  .route({ path: "/" })
  .input(z.object({ name: LocationNameSchema }))
  .handler(async ({ input: { name }, context: { db, user } }) => {
    if (!user) {
      return e
        .select(e.training.Training, (training) => ({
          ...TrainingForLocationShape(training),
          filter: e.all(
            e.set(
              e.op(e.cast(e.training.LocationName, name), "in", training.locations),
              training.enabled,
              e.op("exists", training.rep),
            ),
          ),
        }))
        .run(db);
    }

    const $user = e.assert_exists(e.global.user);

    const getStatus = (training: any) =>
       e.op(
          "Resume",
          "if",
          e.op(
            "exists",
            e.select(e.training.Session, () => ({
              filter_single: { training, user: $user },
            })),
          ),
          "else",
          e.op("Retake", "if", e.op(training, "in", $user.training), "else", "Start"),
        )

    return e
      .select(e.training.Training, (training) => ({
        ...TrainingForLocationShape(training),
        status: getStatus(training),
        rep: {
          id: true,
          description: true,
          status: getStatus(training.rep),
        },
        filter: e.all(
          e.set(
            e.op(e.cast(e.training.LocationName, name), "in", training.locations),
            training.enabled,
            e.op("exists", training.rep),
          ),
        ),
      }))
      .run(db);
  });

export const trainingRouter = pub.prefix("/training").router({
  all,
});
