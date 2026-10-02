#!/bin/sh
# Seeds the devcontainer's empty database with the minimum the app needs to run: roles, teams, the two
# locations, the agreements and reasons the kiosk sign-in flow looks up, and the real tools from
# packages/db/queries/insertTools.edgeql with the training they require. post-create.sh runs it.
# Everything but the tools is made up; edit it here if it starts to matter.
#
# Guards, each of which on its own keeps this off a real database:
#  1. Only runs in the devcontainer (IGNIS_DEVCONTAINER is set by docker-compose.yml).
#  2. Connects by address with a made-up password, never via an instance link: only a Gel server in
#     insecure dev mode accepts that.
#  3. Writes in one transaction that first asserts there are no locations, which every real database has.
# It's also deliberately not a package.json script, so nothing in turbo or the deploy can run it.
set -e
cd "$(dirname "$0")/.."

if [ "$IGNIS_DEVCONTAINER" != "1" ]; then
  echo "seed.sh only runs inside the devcontainer" >&2
  exit 1
fi

# Training insertTools.edgeql looks up by name
training_names="{
  '3D Printer', '3D Scanning', 'Band Saw', 'CNC Mill', 'CNC Router', 'Cricut Cutting Machine',
  'Embroidery Machine', 'Hat Press', 'Heartspace Induction', 'Hot Tools', 'Laser Cutter',
  'Mainspace Induction', 'Mug Press', 'Overlocker', 'Pillar Drill', 'Powered Hand Tools', 'SLA Printer',
  'Sanding Machines', 'Scroll Saw', 'Sewing Machine', 'Sublimation Printer & T-Shirt Press',
  'Unpowered Hand Tools', 'Vacuum Former', 'Vinyl Cutter', 'Water Jet Cutter',
}"

dev_gel() {
  gel --dsn "gel://admin:not-a-real-password@localhost:10705/main" --tls-security insecure "$@"
}

if ! dev_gel query "select 1" >/dev/null 2>&1; then
  echo "The Gel server at localhost:10705 rejected a made-up password, so it isn't the devcontainer's; not seeding" >&2
  exit 1
fi

# Access policies would hide the locations from this session
if [ "$(dev_gel query --output-format=tab-separated "configure session set apply_access_policies := false" \
  "select exists sign_in::Location" 2>/dev/null)" = "true" ]; then
  echo "Database already has locations; not seeding"
  exit 0
fi

# PUB_SUB_WEBHOOK_URL only exists once the schema change adding it has been migrated
set_webhook_url=""
if [ "$(dev_gel query --output-format=tab-separated \
  "select exists (select schema::Global filter .name = 'default::PUB_SUB_WEBHOOK_URL')")" = "true" ]; then
  set_webhook_url="set global default::PUB_SUB_WEBHOOK_URL := 'http://127.0.0.1:9/';"
fi

dev_gel <<EOF
configure session set allow_user_specified_id := true;
configure session set apply_access_policies := false;
# Locations, reasons and agreements are Listenable, so writing them fires notify_webhook, which requires
# these globals. Forge isn't told: the URL points at a port nothing listens on (on older schemas, where
# it's hard-coded to forge, forge rejects the unknown secret)
set global default::PUB_SUB_SECRET := 'seed';
${set_webhook_url}

start transaction;

select assert(not exists sign_in::Location, message := "Database already has locations; refusing to seed");

insert users::Role { name := 'User' } unless conflict on .name;
insert users::Role { name := 'Rep' } unless conflict on .name;
insert users::Role { name := 'Desk' } unless conflict on .name;
# Same id as ADMIN_ROLE in apps/forge/.env.dev, which mine's ALLOWED_TO_UPLOAD also lists
insert users::Role { id := <uuid>'5ea86cc8-f86c-11ee-8cfe-bfcf9fe5f446', name := 'Admin' } unless conflict on .name;

# One team per team::Name, the names the frontend knows (Team.name is a plain str, but
# apps/forge/src/icons/Team.tsx throws on any other)
for name in array_unpack((select schema::ScalarType filter .name = 'team::Name').enum_values)
union (insert team::Team { name := name, description := '' });

# Prod's ids, which packages/db/queries/insertTools.edgeql refers to
insert sign_in::Location {
  id := <uuid>'8f6bc6ca-3624-11ef-a0a2-375e24db936c',
  name := sign_in::LocationName.MAINSPACE,
  opening_days := {1, 2, 3, 4, 5},
  opening_time := <cal::local_time>'09:00',
  closing_time := <cal::local_time>'21:00',
  in_hours_rep_multiplier := 15,
  out_of_hours_rep_multiplier := 8,
  max_users := 45,
};
insert sign_in::Location {
  id := <uuid>'8f7310ba-3624-11ef-a0a2-63dc43f65769',
  name := sign_in::LocationName.HEARTSPACE,
  opening_days := {1, 2, 3, 4, 5},
  opening_time := <cal::local_time>'09:00',
  closing_time := <cal::local_time>'17:00',
  in_hours_rep_multiplier := 15,
  out_of_hours_rep_multiplier := 8,
  max_users := 15,
};

# The sign-in flow looks these up by name (_flows/agreements.ts), and treats the PERSONAL_PROJECT
# reason's agreement as the user agreement (_flows/reasons.ts)
with
  user_agreement := (insert sign_in::Agreement {
    name := 'User Agreement',
    content := '# User Agreement\n\nPlaceholder agreement for local development.',
  }),
  rep_agreement := (insert sign_in::Agreement {
    name := 'Rep Agreement',
    content := '# Rep Agreement\n\nPlaceholder agreement for local development.',
  }),
select {
  (insert sign_in::Reason {
    name := 'Personal Project',
    category := sign_in::ReasonCategory.PERSONAL_PROJECT,
    agreement := user_agreement,
  }),
  (insert sign_in::Reason {
    name := 'Rep On Shift',
    category := sign_in::ReasonCategory.REP_SIGN_IN,
    agreement := rep_agreement,
  }),
};

# Every tool needs user training and the rep training that supervises it: one pair per training
# name insertTools.edgeql looks up (it picks the user training with \`exists .rep\`). Two statements,
# since an insert can't nest another insert of its own type
for name in ${training_names}
union (
  insert training::Training {
    name := name,
    description := 'Placeholder rep training for local development.',
    in_person := false,
    locations := (
      {training::LocationName.MAINSPACE} if name = 'Mainspace Induction' else
      {training::LocationName.HEARTSPACE} if name = 'Heartspace Induction' else
      {training::LocationName.MAINSPACE, training::LocationName.HEARTSPACE}
    ),
  }
);
for rep_training in (select training::Training filter .name in ${training_names})
union (
  insert training::Training {
    name := rep_training.name,
    description := 'Placeholder training for local development.',
    in_person := false,
    locations := rep_training.locations,
    rep := rep_training,
  }
);

$(cat packages/db/queries/insertTools.edgeql)

commit;
EOF

echo "Seeded the dev database"
