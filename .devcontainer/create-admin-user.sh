#!/bin/sh
# Creates a rep with the User, Rep and Admin roles and the user and rep agreements signed, in the
# devcontainer's database, without LDAP: the kiosk's user insert (apps/forge/src/lib/utils/queries.ts),
# with the details typed in, as a users::Rep.
# Signing in with Google afterwards links the account by email.
# For an existing rep, just adds the roles. An existing plain user is recreated as a rep (keeping their
# identity, details and roles), since a User can't be changed into a Rep in EdgeQL.
set -e

ask() {
  printf "%s: " "$1" >&2
  read -r answer
  if [ -z "$answer" ]; then
    echo "$1 is required" >&2
    exit 1
  fi
  echo "$answer"
}

# Runs EdgeQL from stdin with the session setup every write here needs
run() {
  {
    echo "configure session set allow_user_specified_id := true;"
    echo "configure session set apply_access_policies := false;"
    # users::User is Listenable, so writing it fires notify_webhook, which requires these globals.
    # Forge isn't told about this change: the URL points at a port nothing listens on (and on older
    # schemas, where the URL is hard-coded to forge, forge rejects the unknown secret)
    echo "set global default::PUB_SUB_SECRET := 'create-admin-user';"
    echo "$set_webhook_url"
    cat
  } | gel
}

query() {
  gel query --output-format=tab-separated "configure session set apply_access_policies := false" "$1" 2>/dev/null
}

email=$(ask "Email")
# users::User.email is stored lowercase without the domain (see ldap.toInsert in apps/forge/src/ldap.ts)
email=$(echo "${email%@sheffield.ac.uk}" | tr '[:upper:]' '[:lower:]')

# Same id as ADMIN_ROLE in apps/forge/.env.dev, which mine's ALLOWED_TO_UPLOAD also lists
admin_role_id=5ea86cc8-f86c-11ee-8cfe-bfcf9fe5f446

# PUB_SUB_WEBHOOK_URL only exists once the schema change adding it has been migrated
set_webhook_url=""
if [ "$(query "select exists (select schema::Global filter .name = 'default::PUB_SUB_WEBHOOK_URL')")" = "true" ]; then
  set_webhook_url="set global default::PUB_SUB_WEBHOOK_URL := 'http://127.0.0.1:9/';"
fi

roles_setup="
insert users::Role { name := 'User' } unless conflict on .name;
insert users::Role { name := 'Rep' } unless conflict on .name;
insert users::Role { id := <uuid>'${admin_role_id}', name := 'Admin' } unless conflict on .name;
"
roles="(select users::Role filter .name in {'User', 'Rep', 'Admin'})"
# Signed at their current versions, as signing in does (apps/forge/src/api/users/$id/agreements.$agreement_id.ts).
# The names the sign-in flow asks reps for; empty if the seed hasn't created them
agreements="(select sign_in::Agreement { @version_signed := .version } filter .name in {'User Agreement', 'Rep Agreement'})"
# Teams come from seed.sh, one per team::Name: the frontend (apps/forge/src/icons/Team.tsx) throws on
# any other name, so only an existing team is accepted. Team.name isn't exclusive, hence \`limit 1\`
ask_team() {
  teams=$(query "select array_join(array_agg((select team::Team order by .name).name), ', ')")
  if [ -z "$teams" ]; then
    echo "No teams in the database; run .devcontainer/seed.sh on a fresh database first" >&2
    exit 1
  fi
  team=$(ask "Team ($teams)")
  if [ "$(query "select exists (select team::Team filter .name = \$\$${team}\$\$)")" != "true" ]; then
    echo "No team called '$team'" >&2
    exit 1
  fi
  echo "$team"
}
team_expr() {
  echo "(select team::Team filter .name = \$\$$1\$\$ limit 1)"
}

existing_type=$(query "select (select users::User filter .email = \$\$${email}\$\$).__type__.name")

case "$existing_type" in
  users::Rep)
    run <<EOF
$roles_setup
select (update users::User filter .email = \$\$${email}\$\$ set { roles += $roles, agreements_signed += $agreements })
  { email, roles: { name }, agreements_signed: { name } };
EOF
    ;;

  users::User)
    # Recreating drops anything linked to the user that isn't copied below, so refuse if there is any
    attached=$(query "select (select users::User filter .email = \$\$${email}\$\$) {
      n := count(.training) + count(.agreements_signed) + count(.sign_ins) + count(.bookings) + count(.purchases)
        + count(.infractions) + count(.integrations) + count(.mailing_list_subscriptions) + count(.notifications)
    }.n")
    if [ "$attached" != "0" ]; then
      echo "$email has training, sign-ins or other data attached; not recreating them as a rep" >&2
      exit 1
    fi
    team=$(ask_team)
    printf "%s is a plain user. Recreate them as a rep, keeping their identity, details and roles? [y/N] " "$email" >&2
    read -r confirm
    [ "$confirm" = "y" ] || [ "$confirm" = "Y" ] || exit 1

    # Free the exclusive fields, insert the rep copying from the old user, then delete the old user
    run <<EOF
$roles_setup
start transaction;
update users::User filter .email = \$\$${email}\$\$ set {
  email := .email ++ '.converting',
  username := .username ++ '.converting',
  ucard_number := -.ucard_number,
};
with old := assert_exists(assert_single((select users::User filter .email = \$\$${email}.converting\$\$)))
select (insert users::Rep {
  email := \$\$${email}\$\$,
  username := old.username[:-len('.converting')],
  ucard_number := -old.ucard_number,
  first_name := old.first_name,
  last_name := old.last_name,
  display_name := old.display_name,
  pronouns := old.pronouns,
  profile_picture := old.profile_picture,
  organisational_unit := old.organisational_unit,
  funds := old.funds,
  identity := old.identity,
  roles := distinct (old.roles union $roles),
  agreements_signed := $agreements,
  teams := (select $(team_expr "$team") { @created_at := datetime_of_statement() }),
}) { email, display_name, roles: { name }, teams: { name }, agreements_signed: { name } };
delete users::User filter .email = \$\$${email}.converting\$\$;
commit;
EOF
    ;;

  *)
    username=$(ask "University username")
    first_name=$(ask "First name")
    printf "Last name (optional): " >&2
    read -r last_name
    organisational_unit=$(ask "School/department (e.g. IPE)")
    ucard_number=$(ask "UCard number (without the issue number)")
    case "$ucard_number" in
      *[!0-9]*) echo "UCard number must be digits" >&2; exit 1 ;;
    esac
    team=$(ask_team)

    run <<EOF
$roles_setup
select (insert users::Rep {
  email := \$\$${email}\$\$,
  username := \$\$${username}\$\$,
  first_name := \$\$${first_name}\$\$,
  # '' rather than empty: display_name's default only falls back to first_name for ''
  last_name := \$\$${last_name}\$\$,
  organisational_unit := \$\$${organisational_unit}\$\$,
  ucard_number := ${ucard_number},
  roles := $roles,
  agreements_signed := $agreements,
  teams := (select $(team_expr "$team") { @created_at := datetime_of_statement() }),
  # Placeholder like the kiosk's, replaced by the Google identity on first sign-in. Subject is the
  # username rather than the kiosk's '' because (issuer, subject) must be unique
  identity := (insert ext::auth::Identity {
    issuer := 'ignis',
    subject := \$\$${username}\$\$,
    modified_at := datetime_of_statement(),
  }),
}) { email, display_name, roles: { name }, teams: { name }, agreements_signed: { name } };
EOF
    ;;
esac
