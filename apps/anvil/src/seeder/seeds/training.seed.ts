import { readFileSync } from "fs";
import type { EdgeDBService } from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import type { training } from "@dbschema/interfaces";
import { parse } from "csv-parse/sync";
import { ConstraintViolationError } from "edgedb";
import { globSync } from "glob";
import { z } from "zod";

function parseDate(date: string) {
  if (date === "") {
    return;
  }
  const [day, month, year] = date.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export const ParsedTrainingList = z.array(
  z
    .object({
      "Training Course": z.string(),
      Completed: z.string(),
      "Renewal Due": z.string(),
      "Subject Area": z.string(),
      Email: z.string(),
    })
    .transform((training) => {
      const subject_area = training["Subject Area"].split("; ").map((area) => area.trim());
      const rep = subject_area.some((area) => area.toLowerCase().includes("iforge rep training"));
      const lower_name = training["Training Course"].toLowerCase();
      const name = training["Training Course"].replaceAll(/(\(Compulsory\)|In-Person)/gi, "").trim();
      // if (rep) {
      //   name = name.replaceAll(/iForge Rep/gi, "").trimStart();
      // }
      const email = training.Email.slice(0, training.Email.length - "@sheffield.ac.uk".length);
      return {
        name,
        email,
        completed_on: parseDate(training.Completed),
        renewal_due: parseDate(training["Renewal Due"]),
        subject_area,
        compulsory: lower_name.includes("(compulsory)"),
        in_person: lower_name.includes("in-person"),
        rep,
      };
    }),
);

type ParsedTrainingListType = z.infer<typeof ParsedTrainingList>;

type AllTraining = {
  name: string;
  subject_area: string[];
  compulsory: boolean;
  in_person: boolean;
  rep: boolean;
};

type UserTraining = {
  name: string;
  subject_area: string[];
  compulsory?: boolean; // undefined => false
  completed_on?: Date | null; // undefined => null
  completed_in_person_on?: Date | null; // tribool. undefined => no in person required, null is not complete
  renewal_due?: Date | null; // undefined => null
  rep?: boolean; // undefined => null
};

export const seedTraining = async (dbService: EdgeDBService) => {
  const courseFiles = globSync("src/seeder/seeds/courses/*.json");
  const trainings: training.Training[] = courseFiles.map((file) =>
    JSON.parse(readFileSync(file, { encoding: "utf-8" })),
  );
  console.log(trainings);

  // Fetch existing training names from the database
  const existingTrainingNames = await dbService.query(
    e.select(e.training.Training, (training) => ({
      name: true,
    })),
  );

  // Filter out duplicate trainings based on name
  const uniqueTrainings = trainings.filter((training) => !existingTrainingNames.some((t) => t.name === training.name));

  // Insert unique trainings
  await dbService.query(
    e.for(e.json_array_unpack(e.json(uniqueTrainings)), (item) => {
      return e.insert(e.training.Training, {
        name: e.cast(e.str, item.name),
        description: e.cast(e.str, item.description),
        compulsory: e.cast(e.bool, item.compulsory),
        in_person: e.cast(e.bool, item.in_person),
        locations: e.array_unpack(e.cast(e.array(e.training.LocationName), item.locations)),
        questions: e.for(e.json_array_unpack(e.json_get(item, "questions")), (question) => {
          // @ts-ignore TODO FIX?
          return e.insert(e.training.Question, {
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
          // @ts-ignore TODO FIX?
          return e.insert(e.training.Page, {
            name: e.cast(e.str, training_.name),
            content: e.cast(e.str, training_.content),
            index: e.cast(e.int16, training_.index),
            duration: e.cast(e.duration, e.json_get(training_, "duration")),
          });
        }),
      });
    }),
  );

  const global_training = ParsedTrainingList.parse(
    parse(readFileSync("src/seeder/seeds/user_training.csv", { encoding: "utf-8" }), { columns: true }),
  );
  const training_by_user = global_training.reduce(
    (acc, training) => {
      const key = training.email;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(training);
      return acc;
    },
    {} as { [K in string]: ParsedTrainingListType },
  );

  const all_training = parseAllTraining(training_by_user["it.iforge"]);
  const parsed_training_by_user = Object.fromEntries(
    Object.entries(training_by_user).map(([user, trainings]) => [user, parseTrainings(trainings, all_training)]),
  );

  const t = e.json(
    Object.fromEntries(
      Object.entries(parsed_training_by_user).map(([user, trainings]) => {
        const trainingMap = trainings.reduce(
          (acc, training) => {
            acc[training!.name] = training!;
            return acc;
          },
          {} as { [K in string]: UserTraining },
        );

        return [user, trainingMap];
      }),
    ),
  );

  await dbService.query(
    e.for(e.select(e.users.User), (user) => {
      const trainings = e.json_get(t, user.email);
      return e.update(user, () => ({
        set: {
          training: e.select(e.training.Training, (training) => ({
            filter: e.op(training.name, "in", e.cast(e.str, e.json_object_unpack(trainings)[0])),
            "@created_at": e.cast(e.datetime, e.json_get(trainings, training.name, "completed_on")),
            "@in_person_created_at": e.cast(e.datetime, e.json_get(trainings, training.name, "completed_in_person_on")),
          })),
        },
      }));
    }),
  );

  const repInduction = e.select(e.training.Training, (training) => ({
    filter_single: e.op(training.name, "=", "iForge Rep Induction"),
  }));

  await dbService.query(
    e.update(e.training.Training, (training) => {
      const notIsRep = e.op(training.name, "not ilike", "iForge Rep%");
      const repTraining = e.select(e.training.Training, (otherTraining) => ({
        filter: e.re_test(e.op("iForge Rep .*", "++", training.name), otherTraining.name),
      }));

      return {
        set: {
          name: e.str_trim(
            e.op(training.name, "if", notIsRep, "else", e.str_replace(training.name, "iForge Rep", "")),
            " ",
          ),
          rep: e.op(
            e.op(e.assert_single(repTraining), "if", e.op("exists", repTraining), "else", repInduction),
            "if",
            notIsRep,
            "else",
            e.cast(e.training.Training, e.set()),
          ),
        },
      };
    }),
  );
};

function collectTrainings(trainings: ParsedTrainingListType) {
  const seen: { [key: string]: ParsedTrainingListType } = {};

  for (const training of trainings) {
    const val = seen[training.name];
    val ? val.push(training) : (seen[training.name] = [training]);
  }
  return seen;
}

function parseAllTraining(trainings: ParsedTrainingListType): AllTraining[] {
  const seen = collectTrainings(trainings);
  return Object.values(seen).map((trainings) => {
    if (trainings.length === 1 || trainings.length > 2) {
      if (trainings.length > 2) {
        console.error("Training with 3+ pieces to it?");
      }
      return trainings[0];
    }
    const [training_1, training_2] = trainings;
    return {
      ...training_1,
      compulsory: training_1.compulsory || training_2.compulsory,
      in_person: training_1.in_person || training_2.in_person,
    };
  });
}

function parseTrainings(trainings: ParsedTrainingListType, all_training: AllTraining[]) {
  const seen = collectTrainings(trainings);

  return Object.entries(seen)
    .map(([name, trainings]) => {
      const all_training_version = all_training.find((training) => training.name === name);
      if (all_training_version === undefined) {
        console.log(`User has training ${name} not present in total list.`);
        return;
      }
      if (trainings.length === 1 || trainings.length > 2) {
        if (trainings.length > 2) {
          console.error("Training with 3+ pieces to it?");
        }
        const training = trainings[0];
        return {
          ...training,
          compulsory: training.compulsory ? true : undefined,
          completed_in_person_on: all_training_version.in_person ? null : undefined,
          rep: training.rep ? true : undefined,
        } as UserTraining;
      }
      const [training_1, training_2] = trainings;
      const in_person = training_1.in_person ? training_1 : training_2;
      const online = in_person === training_1 ? training_2 : training_1;
      return {
        ...training_1,
        compulsory: training_1.compulsory || training_2.compulsory ? true : undefined,
        completed_on: online.completed_on!,
        completed_in_person_on: in_person.completed_on!,
        renewal_due:
          training_1.renewal_due !== undefined || training_2.renewal_due !== undefined
            ? new Date(
                Math.min(training_1.renewal_due?.getTime() ?? Infinity, training_2.renewal_due?.getTime() ?? Infinity),
              )
            : undefined,
        rep: undefined, // Rep training shouldn't ever be a 2 parter
      } as UserTraining;
    })
    .filter((training) => {
      return training !== undefined;
    });
}
