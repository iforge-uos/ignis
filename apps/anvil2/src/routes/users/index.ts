import { auth } from "@/router";
import { UserShape } from "@/utils/queries";
import e from "@dbschema/edgeql-js";
import { idRouter } from "./$id";

export const all = auth
  .route({ method: "GET", path: "/" })
  .handler(async ({ context: { db } }) => e.select(e.users.User, UserShape).run(db));

export const usersRouter = auth.prefix("/users").router({ all, ...idRouter });
