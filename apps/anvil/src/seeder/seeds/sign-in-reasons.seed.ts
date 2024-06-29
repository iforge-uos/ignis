import { readFileSync } from "fs";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/sign-in/sign-in.service";
import e from "@dbschema/edgeql-js";
import { sign_in } from "@dbschema/interfaces";
import { parse } from "csv-parse/sync";
import { ConstraintViolationError } from "edgedb";

type SignInReason = { name: string; category: sign_in.ReasonCategory };

export async function seedSignInReasons(dbService: EdgeDBService) {
  const filename = "src/seeder/seeds/sign-in-reasons.csv"; // headers name, category
  const unique_names = new Set<string>();
  const reasons: SignInReason[] = parse(readFileSync(filename), {
    columns: true,
  })
    .concat([
      { name: "Personal", category: "PERSONAL_PROJECT" },
      { name: "iForge Event", category: "EVENT" },
      { name: REP_ON_SHIFT, category: "REP_SIGN_IN" },
      { name: REP_OFF_SHIFT, category: "REP_SIGN_IN" },
    ])
    .filter((reason: SignInReason) => {
      if (unique_names.has(reason.name)) {
        return false;
      } else {
        unique_names.add(reason.name);
        return true;
      }
    });
  try {
    await dbService.query(
      e.for(e.json_array_unpack(e.json(reasons)), ({ name, category }) => {
        return e.insert(e.sign_in.Reason, {
          name: e.cast(e.str, name),
          category: e.cast(e.sign_in.ReasonCategory, category),
        });
      }),
    );
  } catch (e) {
    if (!(e instanceof ConstraintViolationError)) {
      throw e;
    }
  }
}
