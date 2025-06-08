import { deskOrAdmin } from "@/router";
import { history } from "./history";
import { create, send } from "./$ucard";

export const signInRouter = deskOrAdmin.prefix("/sign-in").router({
  history,
  create,
  send,
});
