import db from "@/db";
import { LocationName } from "@packages/types/sign_in";

async function supervisingReps(name: LocationName) {
  return e
    .select(e.select(e.sign_in.Location, () => ({ filter_single: { name } })).supervising_reps, () => ({
      id: true,
      display_name: true,
      supervisable_training: true,
    }))
    .run(db);
}
