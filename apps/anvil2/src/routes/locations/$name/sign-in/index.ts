import { deskOrAdmin } from "@/router";
import { history } from "./history";

export const signInRouter = deskOrAdmin.prefix("/sign-in").router({
  history,
});
