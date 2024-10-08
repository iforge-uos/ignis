import { createHash } from "crypto";
import { readFileSync } from "fs";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import { REP_ON_SHIFT } from "@/sign-in/sign-in.service";
import e from "@dbschema/edgeql-js";

type MigratedUser = {
  is_rep: boolean;
  team: string;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  organisational_unit: string;
  ucard_number: number;
  username: string;
  mailing_list_subscriptions: null;
  version_of_ua: string;
};

// Helper function to compute SHA-256 hash of file content
function computeFileHash(filePath: string) {
  const filecontent = readFileSync(filePath, { encoding: "utf-8" });
  const hash = createHash("sha256");
  hash.update(filecontent);
  return hash.digest("hex"); // Returns the hash in hexadecimal format
}

export async function seedUsers(dbService: EdgeDBService) {
  const ua = "src/seeder/seeds/agreement.md";
  const ra = "src/seeder/seeds/rep-agreement.md";
  const filename = "src/seeder/seeds/users.json";

  // Check if agreements already exist before inserting
  const userAgreement = await dbService.query(
    e.select(e.sign_in.Agreement, () => ({
      filter: e.op(e.sign_in.Agreement.content_hash, "=", computeFileHash(ua)),
    })),
  );

  const repAgreement = await dbService.query(
    e.select(e.sign_in.Agreement, () => ({
      filter: e.op(e.sign_in.Agreement.content_hash, "=", computeFileHash(ra)),
    })),
  );

  const user_agreement =
    userAgreement.length > 0
      ? userAgreement[0]
      : await dbService.query(
          e.assert_exists(
            e.update(e.sign_in.Reason, (reason) => ({
              filter_single: e.op(reason.category, "=", e.sign_in.ReasonCategory.PERSONAL_PROJECT),
              set: {
                agreement: e.insert(e.sign_in.Agreement, {
                  name: "User Agreement",
                  content: readFileSync(ua, { encoding: "utf-8" }),
                  content_hash: computeFileHash(ua),
                }),
              },
            })).agreement,
          ),
        );

  const rep_agreement =
    repAgreement.length > 0
      ? repAgreement[0]
      : await dbService.query(
          e.update(e.sign_in.Reason, (reason) => ({
            filter_single: e.op(reason.name, "=", REP_ON_SHIFT),
            set: {
              agreement: e.insert(e.sign_in.Agreement, {
                name: "Rep Agreement",
                content: readFileSync(ra, { encoding: "utf-8" }),
                content_hash: computeFileHash(ra),
              }),
            },
          })),
        );

  // Check if mailing list already exists before inserting
  const mailingList = await dbService.query(
    e.select(e.notification.MailingList, () => ({
      filter: e.op(e.notification.MailingList.name, "=", "User Mailing List"),
    })),
  );

  const mailing_list =
    mailingList.length > 0
      ? mailingList[0]
      : await dbService.query(
          e.insert(e.notification.MailingList, {
            name: "User Mailing List",
            description: "The default mailing list for users.",
          }),
        );

  const all_users: MigratedUser[] = JSON.parse(readFileSync(filename, { encoding: "utf-8" }));
  const users = all_users.filter((user) => !user.is_rep);
  const reps = all_users.filter((user) => user.is_rep);

  const usersWithoutDuplicates = users.reduce((acc, user) => {
    const existingUser = acc.find((u) => u.username === user.username);

    if (!existingUser) {
      acc.push(user);
    } else if (user.ucard_number > existingUser.ucard_number) {
      acc = acc.filter((u) => u.username !== user.username);
      acc.push(user);
    }

    return acc;
  }, [] as any[]);

  const existingEmails = await dbService.query(
    e.select(e.users.User, (user) => ({
      email: true,
    })),
  );

  const newUsers = usersWithoutDuplicates.filter((user) => !existingEmails.some((u) => u.email === user.email));

  await dbService.query(
    e.for(
      e.json_array_unpack(e.json(newUsers)),
      ({
        created_at,
        first_name,
        last_name,
        email,
        organisational_unit,
        ucard_number,
        username,
        mailing_list_subscriptions,
        version_of_ua,
      }) => {
        return e.insert(e.users.User, {
          created_at: e.cast(e.datetime, created_at),
          first_name: e.cast(e.str, first_name),
          last_name: e.cast(e.str, last_name),
          email: e.cast(e.str, email),
          organisational_unit: e.cast(e.str, organisational_unit),
          ucard_number: e.cast(e.int32, ucard_number),
          username: e.cast(e.str, username),
          mailing_list_subscriptions: e.op(
            e.select(e.notification.MailingList, () => ({ filter_single: { id: mailing_list.id } })),
            "if",
            e.cast(e.bool, mailing_list_subscriptions),
            "else",
            e.select(e.notification.MailingList, () => ({
              filter_single: { id: "06350f6e-800d-436c-9d63-8abea087144b" },
            })), // random uuid
          ),
          agreements_signed: e.op(
            e.select(e.sign_in.Agreement, () => ({ filter_single: { id: user_agreement.id } })),
            "if",
            e.cast(e.bool, version_of_ua),
            "else",
            e.select(e.sign_in.Agreement, () => ({ filter_single: { id: "06350f6e-800d-436c-9d63-8abea087144b" } })), // random uuid
          ),
          roles: e.select(e.auth.Role, () => ({ filter_single: { name: "User" } })),
        });
      },
    ),
  );

  for (const rep of reps) {
    const {
      created_at,
      first_name,
      last_name,
      email,
      organisational_unit,
      ucard_number,
      username,
      mailing_list_subscriptions,
      team,
      status,
    } = rep;
    const role_filter = team.includes("IT")
      ? (role: any) => e.op(role.name, "in", e.set("Rep", "Admin"))
      : (role: any) => e.op(role.name, "=", "Rep");
    const existingRep = await dbService.query(
      e.select(e.users.Rep, () => ({
        filter: e.op(e.users.Rep.username, "=", e.cast(e.str, username)),
        limit: 1,
      })),
    );
    if (existingRep.length !== 1) {
      try {
        await dbService.query(
          e.insert(e.users.Rep, {
            created_at: e.cast(e.datetime, created_at),
            first_name: e.cast(e.str, first_name),
            last_name: e.cast(e.str, last_name),
            email: e.cast(e.str, email),
            organisational_unit: e.cast(e.str, organisational_unit),
            ucard_number: e.cast(e.int32, ucard_number),
            username: e.cast(e.str, username),
            mailing_list_subscriptions: e.op(
              e.select(e.notification.MailingList, () => ({ filter_single: { id: mailing_list.id } })),
              "if",
              e.cast(e.bool, mailing_list_subscriptions),
              "else",
              e.select(e.notification.MailingList, () => ({
                filter_single: { id: "06350f6e-800d-436c-9d63-8abea087144b" },
              })), // random uuid
            ),
            agreements_signed: e.select(e.sign_in.Agreement), // lord this is cursed, don't run after inserting multiple agreements other than rep and user
            teams: e.select(e.team.Team, (team_) => ({ filter: e.op(team_.tag, "in", e.set(...team)) })),
            status: e.cast(e.users.RepStatus, status),
            roles: e.select(e.auth.Role, (role) => ({ filter: role_filter(role) })),
          }),
        );
      } catch (e) {
        console.log(e, rep);
      }
    }
  }
}
