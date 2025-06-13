import { deskOrAdmin } from "@/orpc";
import { history } from "./history";
import { create, send } from "./$ucard";
import { signOut } from "./sign-out";

export const signInRouter = deskOrAdmin.prefix("/sign-in").router({
  history,
  create,
  send,
  signOut,
});
