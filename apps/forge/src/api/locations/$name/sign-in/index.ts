import { deskOrAdmin } from "@/orpc";
import { flow, send } from "./$ucard";
import { history } from "./history";

export const signInRouter = deskOrAdmin.prefix("/sign-in").router({
  history,
  flow,
  send,
});
