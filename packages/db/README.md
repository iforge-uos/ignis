# The Schema

## Running Gel

Gel generally has very good [docs](https://geldata.com/docs) that normally clear things up.

Some useful commands for testing:

- `gel watch` - very helpful for making minor changes to the schema locally.
- `gel ui` - opens an interactive web UI for the database to run test queries.

Regeneration:

- `bun interfaces` - regenerates the `interfaces.ts` file.
- `bun edgeql-js` - regenerate the query builder generator.
- `bun queries` - regenerate the queries that can't be built with the generator.
- `bun zod` - regenerates the Zod schema for the DB.

If you want to run all of these at once, `bun regen`.

## Some comments 🥁

Inline comments are why things were done, the `annotation description := "..."` comments are specifically on schema and representation.

## Access Policies

Access policies should be enabled for things we allow CRUD on. Use hierarchical role access. The general structure is followed:

- Admin
- Desk/Special Team Specific Roles/Team membership
- Rep
- User

However, please be careful to not allow full access to the database either way. Access policies are an extra layer of defence and give a nice error message but do not prevent us leaking data/getting our database DOS'd or anything of the sort.

Please avoid putting them on abstract types.

Update policies on fields are a good idea.
