/**
 * Checks the split getSignInTools against the original fused query in packages/db/queries, which is
 * kept around precisely so this comparison is possible. The two must agree exactly: the values
 * decide which machines a user is allowed to sign in to.
 *
 * Needs a database — see apps/forge/src/lib/utils/testing/gel.ts.
 */

import { expect, test } from "bun:test";
import { getSignInTools as fused } from "@packages/db/queries/getSignInTools.query";
import type { Executor } from "gel";
import { getSignInTools as splitQueries } from "@/lib/utils/sign-in-tools";
import { grantTraining, inRolledBackTransaction, insertUser, TrainingState } from "@/lib/utils/testing/gel";

const LOCATIONS = ["MAINSPACE", "HEARTSPACE"] as const;

/**
 * `selectable` is an EdgeQL set constructor, so ordering carries no meaning — and the fused query
 * emits duplicates: `A if C else B` takes the cartesian product when both the condition and the
 * value are set-valued, so n trainings sharing a next step yield n copies of it (n squared, for the
 * next_step term). ToolLegend.tsx maps the array straight to badges, so those show up as repeated
 * badges today. Everything else only ever asks whether the array is empty, so comparing unique
 * values is the real contract.
 */
const normalise = (tools: Awaited<ReturnType<typeof fused>>) =>
  tools
    .map((tool) => ({
      ...tool,
      selectable: [...new Set(tool.selectable)].sort(),
      description: [...new Set(tool.description)].sort(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

async function expectAgreement(tx: Executor, id: string, name: (typeof LOCATIONS)[number], collapse: boolean) {
  // one at a time: `tx` is a transaction, which rejects concurrent queries
  const expected = await fused(tx, { id, name, collapse });
  const actual = await splitQueries(tx, { id, name, collapse });
  expect(normalise(actual)).toEqual(normalise(expected));
  // emptiness is what every consumer bar the legend actually tests
  expect(actual.map((tool) => tool.selectable.length === 0)).toEqual(
    expected.map((tool) => tool.selectable.length === 0),
  );
  return normalise(expected);
}

test("matches the fused query across training states, both users and reps", async () => {
  await inRolledBackTransaction(async (tx) => {
    const userTraining = await tx.query<{ id: string; rep_id: string }>(
      `select training::Training { id, rep_id := .rep.id } filter exists .rep order by .name`,
    );
    const training = userTraining.map((t) => t.id);
    const repTraining = userTraining.map((t) => t.rep_id);
    expect(training.length).toBeGreaterThan(14);

    // The devcontainer seed sets in_person := false everywhere, so without this the in-person bits of
    // get_status's key never vary and most of the lookup table goes untested.
    const inPerson = `update training::Training filter .id in array_unpack(<array<uuid>>$ids) set { in_person := true }`;
    await tx.execute(inPerson, { ids: training.slice(0, 8) });
    await tx.execute(inPerson, { ids: repTraining.slice(4, 12) });

    // A tool that requires rep training reaches get_status's `not is_user_training` branch, which
    // returns an empty set when collapsed.
    await tx.execute(
      `update (select tools::Tool limit 1) set {
         training += (select training::Training filter not exists .rep limit 1)
       }`,
    );

    const user = await insertUser(tx, { rep: false }, 1);
    const rep = await insertUser(tx, { rep: true }, 2);

    await grantTraining(tx, user.id, training.slice(0, 5), TrainingState.online);
    await grantTraining(tx, user.id, training.slice(5, 10), TrainingState.inPerson);
    await grantTraining(tx, user.id, training.slice(10, 13), TrainingState.revoked);

    await grantTraining(tx, rep.id, training.slice(0, 6), TrainingState.online);
    await grantTraining(tx, rep.id, training.slice(6, 14), TrainingState.inPerson);
    await grantTraining(tx, rep.id, repTraining.slice(0, 8), TrainingState.online);
    await grantTraining(tx, rep.id, repTraining.slice(8, 16), TrainingState.inPerson);
    await grantTraining(tx, rep.id, repTraining.slice(16, 18), TrainingState.revoked);

    // With nobody on shift the location supervises nothing, so REPS_UNTRAINED applies to every tool
    // a plain user looks at; with a rep signed in it applies only to what they can't supervise.
    const seen = new Set<string>();
    for (const supervised of [false, true]) {
      if (supervised) {
        await tx.execute(
          `insert sign_in::SignIn {
             user := (select users::User filter .id = <uuid>$id),
             location := (select sign_in::Location filter .name = sign_in::LocationName.MAINSPACE),
             reason := (select sign_in::Reason filter .name = "Rep On Shift"),
             tools := {},
           }`,
          { id: rep.id },
        );
      }
      for (const id of [user.id, rep.id]) {
        for (const name of LOCATIONS) {
          for (const collapse of [false, true]) {
            for (const tool of await expectAgreement(tx, id, name, collapse)) {
              for (const value of tool.selectable) seen.add(value);
            }
          }
        }
      }
    }

    // Guard against the comparison passing because every tool came back plainly selectable
    expect([...seen].sort()).toEqual(expect.arrayContaining(["DO_ONLINE", "DO_IN_PERSON", "REPS_UNTRAINED"]));
    console.log("selectability values exercised:", [...seen].sort().join(", "));
  });
}, 600_000);
