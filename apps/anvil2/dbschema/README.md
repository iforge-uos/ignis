# The Schema

## Running EdgeDB

EdgeDB generally has very good [docs](https://www.edgedb.com/docs) that normally clear things up.

Some useful commands for testing:

- `edgedb watch` - very helpful for making minor changes to the schema locally.
- `edgedb ui` - opens an interactive web UI for the database to run test queries.

Regeneration:

- `npx @edgedb/generate interfaces` - regenerates the `interfaces.ts` file.
- `npx @edgedb/generate edgeql-js` - regenerate the query builder generator.
- `pnpm edgedb-zod` - regenerates the Zod schema for the DB.

  **These Must Be Extended If You Use `z.date` (use `z.string().datetime()`)**

If you want to run all of these at once, `pnpm regen`.

## Some comments 🥁

Inline comments are why things were done, the `annotation description := "..."` comments are specifically on schema and representation.

