import { auth } from "@/orpc";
import { UserShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";
import { idRouter } from "./$id";
import { me } from "./me";
import { search } from "./search";

export const all = auth
  .route({ method: "GET", path: "/" })
  .handler(async ({ context: { db } }) => e.select(e.users.User, UserShape).run(db));

export const usersRouter = auth.prefix("/users").router({ all, me, ...idRouter, search });
