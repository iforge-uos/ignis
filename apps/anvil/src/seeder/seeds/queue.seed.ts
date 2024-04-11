import { EdgeDBService } from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import { ConstraintViolationError } from "edgedb";

export async function seedQueue(dbService: EdgeDBService) {
  try {
    await dbService.query(
      e.for(e.set("HEARTSPACE", "MAINSPACE"), (location) => {
        return e.insert(e.sign_in.List, {
          location: e.cast(e.sign_in.SignInLocation, location),
        });
      }),
    );
  } catch (e) {
    if (!(e instanceof ConstraintViolationError)) {
      throw e;
    }
  }
}
