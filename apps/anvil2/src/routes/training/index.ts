import { pub } from "@/router";
import e from "@dbschema/edgeql-js";
import { training } from "@dbschema/interfaces";
import { get } from "./$id";
import { idRouter } from "./$id";

export interface AllTraining {
  id: string;
  rep: {
    id: string;
    description: string;
  };
  name: string;
  description: string;
  locations: training.LocationName[];
}

export const all = pub.route({ path: "/" }).handler(
  async ({ context: { db } }) =>
    e
      .select(e.training.Training, (training) => ({
        id: true,
        name: true,
        description: true,
        locations: true,
        rep: {
          id: true,
          description: true,
        },
        filter: e.op(e.op("exists", training.rep), "and", training.enabled),
        order_by: training.name,
      }))
      .run(db) as Promise<AllTraining[]>, // training.rep isn't narrowed to non-null
);

export const trainingRouter = pub.prefix("/training").router({
  all,
  ...idRouter,
});
