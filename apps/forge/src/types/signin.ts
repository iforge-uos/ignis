import { Location, LocationStatus, Reason, Training } from "@ignis/types/sign_in.ts";

export interface SignInState {
  active_location: Location;
  is_loading: boolean;
  error: string;
  locations: LocationStatus[];
  session: SignInSession | null;
}

// TODO IDEALLY THIS WOULD BE A SESSION PER FLOW TYPE BUT I DON'T WANT TO REFACTOR THE WHOLE THING RN
export interface SignInSession {
  ucard_number: number | null;
  is_rep: boolean;
  sign_in_reason: Reason | null;
  training: Training[] | null;
  navigation_is_backtracking: boolean;
  session_errored: boolean;
  username: string | null;
}
