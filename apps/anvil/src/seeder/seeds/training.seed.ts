import { readFileSync, writeFileSync } from "fs";
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
  // const courseFiles = globSync("src/seeder/seeds/courses/powered-handtools.json");
  // const trainings: training.Training[] = ["src/seeder/seeds/courses/powered-handtools.json"].map((file) =>
  //   JSON.parse(readFileSync(file, { encoding: "utf-8" })),
  // );
  // console.log(trainings);

  // Fetch existing training names from the database
  // const existingTrainingNames = await dbService.query(
  //   e.select(e.training.Training, (training) => ({
  //     name: true,
  //   })),
  // );

  // Filter out duplicate trainings based on name
  // const uniqueTrainings = trainings.filter((training) => !existingTrainingNames.some((t) => t.name === training.name));

  // Insert unique trainings
  // await dbService.query(
  //   e.for(e.json_array_unpack(e.json(trainings)), (item) => {
  //     return e.insert(e.training.Training, {
  //       name: e.cast(e.str, item.name),
  //       description: e.cast(e.str, item.description),
  //       compulsory: e.cast(e.bool, item.compulsory),
  //       in_person: e.cast(e.bool, item.in_person),
  //       locations: e.array_unpack(e.cast(e.array(e.training.TrainingLocation), item.locations)),
  //       questions: e.for(e.json_array_unpack(e.json_get(item, "questions")), (question) => {
  //         // @ts-ignore TODO FIX?
  //         return e.insert(e.training.Question, {
  //           content: e.cast(e.str, question.content),
  //           index: e.cast(e.int16, question.index),
  //           type: e.cast(e.training.AnswerType, question.type),
  //           answers: e.for(e.json_array_unpack(question.answers), (answer) => {
  //             return e.insert(e.training.Answer, {
  //               content: e.cast(e.str, answer.content),
  //               correct: e.op(e.cast(e.bool, e.json_get(answer, "correct")), "??", false),
  //             });
  //           }),
  //         });
  //       }),
  //       pages: e.for(e.json_array_unpack(e.json_get(item, "pages")), (training_) => {
  //         // @ts-ignore TODO FIX?
  //         return e.insert(e.training.TrainingPage, {
  //           name: e.cast(e.str, training_.name),
  //           content: e.cast(e.str, training_.content),
  //           index: e.cast(e.int16, training_.index),
  //           duration: e.cast(e.duration, e.json_get(training_, "duration")),
  //         });
  //       }),
  //     });
  //   }),
  // );

  // const global_training = ParsedTrainingList.parse(
  //   parse(readFileSync("src/seeder/seeds/trainings.csv", { encoding: "utf-8" }), { columns: true }),
  // );
  // const training_by_user = global_training.reduce(
  //   (acc, training) => {
  //     const key = training.email;
  //     if (!acc[key]) {
  //       acc[key] = [];
  //     }
  //     acc[key].push(training);
  //     return acc;
  //   },
  //   {} as { [K in string]: ParsedTrainingListType },
  // );

  // const all_training = parseAllTraining(training_by_user["it.iforge"]);
  // const parsed_training_by_user = Object.fromEntries(
  //   Object.entries(training_by_user).map(([user, trainings]) => [user, parseTrainings(trainings, all_training)]),
  // );

  const data = [
    {
      display_name: "Henry Rong",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-11-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-11-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-11-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-11-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-12-19T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-11-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2021-12-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2021-10-28T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Tom Huyghe",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2024-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Pete Mylon",
      training: [],
    },
    {
      display_name: "Sophie Rourke",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Kalia Themistocleous",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2021-10-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Lara Abouelnour",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Yun Cho",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2021-10-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2021-10-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2021-10-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2021-10-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2021-10-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2021-10-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Howell Cole",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-11-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Emily Connolly",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-11-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-12-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-11-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-11-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-11-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-11-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-11-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2024-02-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Isha Mistry",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Matthew Wood",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-12-11T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-12-09T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Rahman Pervaiz",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "CT",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-02-19T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2021-10-27T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Jacob Holt",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Bhav Prajapat",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2019-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2020-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2019-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2021-03-18T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2019-11-28T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2020-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Joanna Jones",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-03-16T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2020-11-09T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-03-16T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Christopher Meeks",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2021-11-17T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-09-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-10-31T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Matt Bryan-Smith",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Donggil Kim",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-01-03T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-01-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-01-11T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-01-24T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-01-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-01-24T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Siya Pradhan",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Kira Palmer",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-10-03T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-10-03T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-10-03T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-11-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-02-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-02-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Yap Qing",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-11-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ola Komorowska",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-02-16T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-02-16T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-15T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2024-02-23T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-02-16T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2024-02-23T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Khadija Awwal Manga",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-26T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Harvey Brown",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-11-23T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Matius Chong",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-10-05T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-03-02T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Bhoomika Gandhi",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2021-12-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2020-11-24T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2021-12-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2021-12-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-04-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2021-12-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2021-12-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-06-17T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ted Barganski",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-04-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-04-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-04-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-04-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-04-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-04-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-04-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ayman Shaikh",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-05T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Will Xupravati",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-11-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-11-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-11-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2024-02-22T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Krish Ananthakrishnan",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Robbie Bowen",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-10-18T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Arush Mendon",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Chalisa Pusitdhikul",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-03-17T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-10-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-10-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-10-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-10-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-04-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Harley Sergeant",
      training: [
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-10-11T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-10-18T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-11-30T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-11-25T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-11-18T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-11-18T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ibby El-Serafy",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-03-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-03-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-03-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Alex Perelli",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-17T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-10T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-10T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-11T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-10T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Jen Ward-Tsang",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-11-16T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Simone Jain",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-02-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "iForge Desk",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-10-05T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2018-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2018-09-18T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ryan Jones",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-02-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-12-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Sam :)",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-09-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Vivian Fung",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-11-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-11-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Nat Tsang",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-06-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-06-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-06-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-06-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-06-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-06-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-06-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Brandon O'Connell",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2020-09-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2021-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2020-09-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2020-09-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2020-09-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2020-09-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2021-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Harriet Owen",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-12-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2021-12-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-12-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-12-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-12-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-12-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-12-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "George Boufidis",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2021-10-07T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Thomas Dawson",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-13T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-11-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Haydn Diniz",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2021-10-24T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2021-10-24T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2021-10-24T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2021-10-24T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2021-10-24T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2021-10-24T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2021-10-28T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2021-10-28T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Will or William Du",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-11-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Timothy Harris",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-10-03T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Hateem Mohammed-Janjua",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-01-22T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-01-22T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-01-22T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-01-22T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-01-22T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-01-22T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2021-11-11T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Eromu Ehwerhemuepha",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-07-26T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-07-26T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-07-26T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-10-10T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-07-26T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Agnes Zajac",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-02-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-11-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-11-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-11-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-11-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-11-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-11-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-11-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Marcus Young",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-09-28T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-04-29T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Daniele Ferretti",
      training: [],
    },
    {
      display_name: "Verity Martin",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2024-03-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-03-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-03-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ewan Cooper",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-11-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-02-17T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-11-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-02-17T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Joey Martinez",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-02T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-02-06T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-02-06T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2024-02-13T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-11-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-14T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Jessica Jayakumar",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-02-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-02-26T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Callum Holyer",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-12-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-12-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-12-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Sarah Shaikh",
      training: [
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-02-06T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-02-06T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-25T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-11-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Eloise Hieatt",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Rameen Musharaf",
      training: [],
    },
    {
      display_name: "Osman Hussain",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ranim AbouElAdab",
      training: [],
    },
    {
      display_name: "Luc Dewulf",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-10-04T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ellis Marriott",
      training: [],
    },
    {
      display_name: "Bei En Lim",
      training: [],
    },
    {
      display_name: "Amalia Kastrinos",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-15T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-15T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Alf Salmon",
      training: [],
    },
    {
      display_name: "Lakeson PCY",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-10-01T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Rachel Kovacs",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2022-10-06T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2022-10-06T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2022-10-06T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2022-10-06T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-02-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-10-06T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-10-06T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2022-10-06T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Subin Pariyar",
      training: [
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-12-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Jevon Okolo",
      training: [],
    },
    {
      display_name: "Tadros Khalil",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-11-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-11-02T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-11-10T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Joe Moore",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-10-08T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ujjwal Manda",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-10-12T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-11-07T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-11-16T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-11-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "James Lok",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-03-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-10-16T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-10-16T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-10-16T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-10-16T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2022-04-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2022-04-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-11-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Nour Zahran",
      training: [],
    },
    {
      display_name: "Josya Nath",
      training: [],
    },
    {
      display_name: "Madhu Rajendran",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-03-02T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-03-02T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-03-02T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Neha Myadam",
      training: [],
    },
    {
      display_name: "Oscar Lodge",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Rohaan Khawaja",
      training: [],
    },
    {
      display_name: "Sanvi Jain",
      training: [],
    },
    {
      display_name: "Saxon McKenzie-Smith",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-03-15T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Shreenij Maharjan",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-04-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-04-09T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Henry Lennox",
      training: [],
    },
    {
      display_name: "Sophie Leaver",
      training: [
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2024-03-11T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Summer Rong",
      training: [],
    },
    {
      display_name: "Sydney Jaikaran Roberts",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-02-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Torin Mcvean",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-03-09T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-03-12T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-03-09T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Keith Cheng",
      training: [],
    },
    {
      display_name: "James Hilton-Balfe",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2023-09-28T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2023-11-17T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2023-12-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2023-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2023-12-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2023-12-14T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2023-11-18T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-11-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Fanklin Shen",
      training: [
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2022-03-28T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2021-09-21T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902622-fa6a-11ee-9708-b38c95b12f82",
          "@created_at": "2023-11-01T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Anja Salta",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-02-28T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-03-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-03-08T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2024-02-28T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ayesha Rauf",
      training: [
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-04-22T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-04-22T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ellen Armitage",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-04-23T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c903ac2-fa6a-11ee-9708-6b0fafde4d69",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c904f62-fa6a-11ee-9708-1b474d544440",
          "@created_at": "2024-03-04T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Ethan Tsang",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-03-03T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-03-03T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-03-03T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9036b2-fa6a-11ee-9708-ff1dcaaebbb3",
          "@created_at": "2024-03-03T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2024-03-03T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Helia Mirakhori",
      training: [],
    },
    {
      display_name: "Ibrahim Haider",
      training: [],
    },
    {
      display_name: "James Vaidya",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-02-29T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-03-06T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-03-06T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Joan JY Lo",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c9042d8-fa6a-11ee-9708-af1cc05238b6",
          "@created_at": "2024-04-30T23:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
    {
      display_name: "Joe Harrison",
      training: [],
    },
    {
      display_name: "Josie Green",
      training: [
        {
          id: "2c903ed2-fa6a-11ee-9708-2baff104e1ae",
          "@created_at": "2024-03-11T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902a3c-fa6a-11ee-9708-6b31f7fbc595",
          "@created_at": "2024-03-11T00:00:00+00:00",
          "@in_person_created_at": null,
        },
        {
          id: "2c902e74-fa6a-11ee-9708-3361f5b40727",
          "@created_at": "2024-03-11T00:00:00+00:00",
          "@in_person_created_at": null,
        },
      ],
    },
  ];
  const all_rep_trainings = e.json(
    data.reduce((acc, item) => {
      acc[item.display_name] = Object.fromEntries(item.training.map((t) => [t.id, t]));
      return acc;
    }, {} as any),
  );

  // console.log(
  await dbService.query(
    e.for(e.select(e.users.Rep), (user) => {
      return e.update(user, () => {
        const trainings = e.cast(e.uuid, e.json_object_unpack(e.json_get(all_rep_trainings, user.display_name))[0]);
        return {
          set: {
            training: {
              "+=": e.select(e.training.Training, (training) => ({
                filter: e.op(training.id, "in", trainings),
                "@created_at": e.cast(e.datetime, e.json_get(all_rep_trainings, user.display_name, "@created_at")),
                "@in_person_created_at": e.cast(
                  e.datetime,
                  e.json_get(all_rep_trainings, user.display_name, "@in_person_created_at"),
                ),
              })),
            },
          },
        };
      });
    }),
  );
  return;
  // const repInduction = e.select(e.training.Training, (training) => ({
  //   filter_single: e.op(training.name, "=", "iForge Rep Induction"),
  // }));

  // await dbService.query(
  //   e.update(e.training.Training, (training) => {
  //     const notIsRep = e.op(training.name, "not ilike", "iForge Rep%");
  //     const repTraining = e.select(e.training.Training, (otherTraining) => ({
  //       filter: e.re_test(e.op("iForge Rep .*", "++", training.name), otherTraining.name),
  //     }));

  //     return {
  //       set: {
  //         name: e.str_trim(
  //           e.op(training.name, "if", notIsRep, "else", e.str_replace(training.name, "iForge Rep", "")),
  //           " ",
  //         ),
  //         rep: e.op(
  //           e.op(e.assert_single(repTraining), "if", e.op("exists", repTraining), "else", repInduction),
  //           "if",
  //           notIsRep,
  //           "else",
  //           e.cast(e.training.Training, e.set()),
  //         ),
  //       },
  //     };
  //   }),
  // );
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
