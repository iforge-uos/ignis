import {SignInState} from "@/redux/signin/signin.types.ts";

export const defaultSignInState: SignInState = {
    active_location: "",
    is_loading: false,
    error: "",
    locations: [],
    session: null
}
