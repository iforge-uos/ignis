import { EdgeDBService } from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import { ConstraintViolationError, LocalTime } from "edgedb";

export async function seedQueue(dbService: EdgeDBService) {
  try {
    await dbService.query(
      e.for(e.set("HEARTSPACE", "MAINSPACE"), (location) => {
        return e.insert(e.sign_in.Location, {
          name: e.cast(e.sign_in.LocationName, location),
          closing_time: new LocalTime(),
          opening_time: new LocalTime(),
          in_of_hours_rep_multiplier: 15,
          max_users: 10,
          out_of_hours_rep_multiplier: 8,
        });
      }),
    );
  } catch (e) {
    if (!(e instanceof ConstraintViolationError)) {
      throw e;
    }
  }
}
