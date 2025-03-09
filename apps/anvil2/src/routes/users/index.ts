import { auth } from "@/router";
import { UserShape } from "@/utils/queries";
import e from "@dbschema/edgeql-js";
import { userRouter } from "./$id";

export const all = auth
  .route({ method: "GET", path: "/" })
  .handler(async ({ context: { db } }) => e.select(e.users.User, UserShape).run(db));

export const usersRoute = auth.prefix("/users").router({ all, ...userRouter });
