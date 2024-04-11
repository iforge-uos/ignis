import { readFileSync } from "fs";
import type { EdgeDBService } from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import type { training } from "@dbschema/interfaces";
import { ConstraintViolationError } from "edgedb";

export const seedTraining = async (dbService: EdgeDBService) => {
  let training: training.Training = JSON.parse(readFileSync("src/seeder/seeds/workshop.json", { encoding: "utf-8" }));
  const trainings = [training];

  // Fetch existing training names from the database
  const existingTrainingNames = await dbService.query(
    e.select(e.training.Training, (training) => ({
      name: true,
    })),
  );

  // Filter out duplicate trainings based on name
  const uniqueTrainings = trainings.filter((training) => !existingTrainingNames.some((t) => t.name === training.name));

  try {
    // Insert unique trainings
    await dbService.query(
      e.for(e.json_array_unpack(e.json([training])), (item) => {
        return e.insert(e.training.Training, {
          name: e.cast(e.str, item.name),
          description: e.cast(e.str, item.description),
          compulsory: e.cast(e.bool, item.compulsory),
          in_person: e.cast(e.bool, item.in_person),
          locations: e.array_unpack(e.cast(e.array(e.training.TrainingLocation), item.locations)),
        });
      }),
    );

    // Update training with questions and pages
    await dbService.query(
      e.for(e.json_array_unpack(e.json(uniqueTrainings)), (item) => {
        const training = e.select(e.training.Training, (training) => ({
          filter_single: e.op(
            e.op(training.name, "=", e.cast(e.str, item.name)),
            "and",
            e.op(training.description, "=", e.cast(e.str, item.description)),
          ),
        }));
        return e.update(training, () => ({
          set: {
            questions: e.for(e.json_array_unpack(e.json_get(item, "questions")), (question) => {
              return e.insert(e.training.Question, {
                parent: training,
                content: e.cast(e.str, question.content),
                index: e.cast(e.int16, question.index),
                type: e.cast(e.training.AnswerType, question.type),
                answers: e.for(e.json_array_unpack(question.answers), (answer) => {
                  return e.insert(e.training.Answer, {
                    content: e.cast(e.str, answer.content),
                    correct: e.op(e.cast(e.bool, e.json_get(answer, "correct")), "??", false),
                  });
                }),
              });
            }),
            pages: e.for(e.json_array_unpack(e.json_get(item, "pages")), (training_) => {
              return e.insert(e.training.TrainingPage, {
                parent: training,
                name: e.cast(e.str, training_.name),
                content: e.cast(e.str, training_.content),
                index: e.cast(e.int16, training_.index),
                duration: e.cast(e.duration, e.json_get(training_, "duration")),
              });
            }),
          },
        }));
      }),
    );
  } catch (e) {
    if (!(e instanceof ConstraintViolationError)) {
      throw e;
    }
  }
};
