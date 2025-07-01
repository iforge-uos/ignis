import { auth, pub } from "@/orpc";
import { TrainingForLocationShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/training";
import { z } from "zod/v4";

export const all = pub
  .route({ path: "/" })
  .input(z.object({ name: LocationNameSchema }))
  .handler(async ({ input: { name }, context: { db, user } }) => {
    if (!user) {
      return e
        .select(e.training.Training, (training) => ({
          ...TrainingForLocationShape(training),
          filter: e.all(e.set(e.op(name, "in", training.locations), e.op("exists", training.rep), training.enabled)),
        }))
        .run(db);
    }

    return e
      .select(e.training.Training, (training) => ({
        ...TrainingForLocationShape(training),
        status: e.op(
          "Resume" as const,
          "if",
          e.op(
            "exists",
            e.select(e.training.Session, (session) => ({
              filter_single: e.op(e.op(training, "=", session.training), "and", e.op(session.user, "=", e.user)),
            })),
          ),
          "else",
          e.op("Retake" as const, "if", e.op(training, "in", e.user.training), "else", "Start" as const),
        ),
        filter: e.all(e.set(e.op(name, "in", training.locations), training.enabled)),
      }))
      .run(db);
  });

export const trainingRouter = auth.prefix("/training").router({
  all,
});
