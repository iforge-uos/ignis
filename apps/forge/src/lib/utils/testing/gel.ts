import { createClient, type Transaction } from "gel";

/**
 * The devcontainer's Gel server, which .devcontainer/docker-compose.yml publishes on the host's
 * loopback. Set GEL_DSN to point somewhere else; inside the devcontainer the linked `ignis` instance
 * is at the same address. Tests that use this need a database — see .devcontainer/README.md.
 */
export const testClient = createClient({
  dsn: process.env.GEL_DSN ?? "gel://admin:not-a-real-password@localhost:10705/main",
  tlsSecurity: "insecure",
})
  .withConfig({ apply_access_policies: false })
  // Every write to a Listenable type fires notify_webhook, which asserts both of these are set. The
  // URL points at a port nothing listens on, the same trick .devcontainer/seed.sh uses.
  .withGlobals({ PUB_SUB_SECRET: "test", PUB_SUB_WEBHOOK_URL: "http://127.0.0.1:9/" });

class Rollback extends Error {}

/**
 * Runs `fn` inside a transaction that is always rolled back, so tests can insert whatever they need
 * without persisting it. Mirrors packages/db/tests/utils.ts, which does the same for the DB tests.
 */
export async function inRolledBackTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
  let result!: T;
  try {
    await testClient.transaction(async (tx) => {
      result = await fn(tx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
  return result;
}

const IDENTITY = `(insert ext::auth::Identity {
  issuer := "test", subject := <str>$subject, modified_at := datetime_of_statement()
})`;

export async function insertUser(tx: Transaction, { rep }: { rep: boolean }, n: number) {
  return tx.queryRequiredSingle<{ id: string }>(
    `with identity := ${IDENTITY}
     select (insert users::${rep ? "Rep" : "User"} {
       ucard_number := <int32>$ucard,
       username := <str>$username,
       email := <str>$username,
       organisational_unit := "Test",
       first_name := <str>$first_name,
       last_name := "Test",
       identity := identity,
       ${rep ? "teams := (select team::Team limit 1)," : ""}
     }) { id }`,
    {
      subject: `test-${n}`,
      ucard: 900_000_000 + n,
      username: `testuser${n}`,
      first_name: rep ? "Rep" : "User",
    },
  );
}

/** Link properties on users::User.training, which is how a training's state is recorded. */
export const TrainingState = {
  online: "@created_at := datetime_of_statement()",
  inPerson: "@created_at := datetime_of_statement(), @in_person_created_at := datetime_of_statement()",
  revoked: "@created_at := datetime_of_statement(), @infraction := <uuid>'00000000-0000-0000-0000-0000000000ff'",
} as const;

export async function grantTraining(
  tx: Transaction,
  user: string,
  training: string[],
  state: (typeof TrainingState)[keyof typeof TrainingState],
) {
  if (!training.length) return;
  await tx.execute(
    `update users::User filter .id = <uuid>$user set {
       training += (select training::Training { ${state} } filter .id in array_unpack(<array<uuid>>$training))
     }`,
    { user, training },
  );
}
