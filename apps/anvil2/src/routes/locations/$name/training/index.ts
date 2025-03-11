import { auth, pub } from "@/router";
import { TrainingForLocationShape } from "@/utils/queries";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/training";
import e from "@dbschema/edgeql-js";
import { z } from "zod";

export const all = pub
  .route({ path: "/" })
  .input(z.object({ name: LocationNameSchema }))
  .handler(async ({ input: { name }, context: { db, user } }) => {
    if (!user)
      return e
        .select(e.training.Training, (training) => ({
          ...TrainingForLocationShape(training),
          filter: e.all(e.set(e.op(name, "in", training.locations), e.op("exists", training.rep), training.enabled)),
        }))
        .run(db);

    return e
      .select(e.training.Training, (training) => ({
        ...TrainingForLocationShape(training),
        status: e.op(
          "Resume",
          "if",
          e.op(
            "exists",
            e.select(e.training.Session, (session) => ({
              filter_single: e.op(e.op(training, "=", session.training), "and", e.op(session.user, "=", e.user)),
            })),
          ),
          "else",
          e.op("Retake", "if", e.op(training, "in", e.user.training), "else", "Start"),
        ),
        filter: e.all(e.set(e.op(name, "in", training.locations), training.enabled)),
      }))
      .run(db);
  });

export const trainingRouter = auth.prefix("/training").router({
  all,
});
