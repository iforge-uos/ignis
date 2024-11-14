import { sign_in } from "@ignis/types";
import {Reason, Training } from "@ignis/types/sign_in.ts";

// TODO IDEALLY THIS WOULD BE A SESSION PER FLOW TYPE BUT I DON'T WANT TO REFACTOR THE WHOLE THING RN
export interface SignInSession {
  ucard_number: string;
  user: sign_in.User | null;
  sign_in_reason: Reason | null;
  training: Training[] | null;
  navigation_is_backtracking: boolean;
  session_errored: boolean;
}
