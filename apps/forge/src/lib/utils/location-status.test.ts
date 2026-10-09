/**
 * Checks deriveLocationStatus against the database's own definitions: `sign_in::Location.max_count`
 * and the `user_count` subquery that LocationStatusShape used to run. Those computeds are still in
 * the schema, so this pins the TypeScript copy to them.
 *
 * Needs a database — see apps/forge/src/lib/utils/testing/gel.ts.
 */
import { expect, test } from "bun:test";
import type { Transaction } from "gel";
import { deriveLocationStatus } from "@/lib/utils/location-status";
import { inRolledBackTransaction, insertUser } from "@/lib/utils/testing/gel";

/** Everything deriveLocationStatus needs, alongside what the DB makes of the same location. */
const COMPARISON = `\
select sign_in::Location {
    name,
    out_of_hours,
    max_users,
    in_hours_rep_multiplier,
    out_of_hours_rep_multiplier,
    on_shift_rep_count := count(.on_shift_reps),
    off_shift_rep_count := count(.off_shift_reps),
    sign_in_count := count(.sign_ins),
    db_max_count := .max_count,
    db_user_count := count((select .sign_ins.user filter .__type__.name = 'users::User')),
} order by .name`;

type Row = Parameters<typeof deriveLocationStatus>[0] & {
  name: string;
  db_max_count: number;
  db_user_count: number;
};

async function signIn(tx: Transaction, user: string, location: string, onShift: boolean) {
  await tx.execute(
    `insert sign_in::SignIn {
       user := (select users::User filter .id = <uuid>$user),
       location := (select sign_in::Location filter .name = <sign_in::LocationName>$location),
       reason := (select sign_in::Reason filter .name = <str>$reason),
       tools := {},
     }`,
    { user, location, reason: onShift ? "Rep On Shift" : "Personal Project" },
  );
}

async function expectAgreement(tx: Transaction, label: string) {
  const rows = await tx.query<Row>(COMPARISON);
  expect(rows.length).toBe(2);
  for (const row of rows) {
    const derived = deriveLocationStatus(row);
    expect({ where: `${label}/${row.name}`, ...derived }).toEqual({
      where: `${label}/${row.name}`,
      ...derived,
      user_count: row.db_user_count,
      max_count: row.db_max_count,
    });
  }
  return rows;
}

test("derives user_count and max_count exactly as the database does", async () => {
  await inRolledBackTransaction(async (tx) => {
    await expectAgreement(tx, "empty");

    const reps = [await insertUser(tx, { rep: true }, 11), await insertUser(tx, { rep: true }, 12)];
    const users = [await insertUser(tx, { rep: false }, 13), await insertUser(tx, { rep: false }, 14)];

    await signIn(tx, reps[0].id, "MAINSPACE", true);
    const onShift = await expectAgreement(tx, "one on-shift rep");
    expect(onShift.find((r) => r.name === "MAINSPACE")?.on_shift_rep_count).toBe(1);

    await signIn(tx, reps[1].id, "MAINSPACE", false);
    const offShift = await expectAgreement(tx, "plus an off-shift rep");
    expect(offShift.find((r) => r.name === "MAINSPACE")?.off_shift_rep_count).toBe(1);

    await signIn(tx, users[0].id, "MAINSPACE", false);
    await signIn(tx, users[1].id, "HEARTSPACE", false);
    const withUsers = await expectAgreement(tx, "plus plain users at both locations");

    // the whole point is that these are non-zero, or the comparison proves nothing
    const mainspace = withUsers.find((r) => r.name === "MAINSPACE");
    expect(mainspace?.db_user_count).toBe(1);
    expect(mainspace?.db_max_count).toBeGreaterThan(0);
    expect(withUsers.find((r) => r.name === "HEARTSPACE")?.db_user_count).toBe(1);
  });
}, 120_000);
