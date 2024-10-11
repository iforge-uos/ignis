import { RESET_APP } from "@/types/common.ts";
import { SignInSession, SignInState } from "@/types/signin.ts";
import { LocationName, PartialLocation } from "@ignis/types/sign_in.ts";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { RootState } from "./store";

const defaultSignInState: SignInState = {
  active_location: "MAINSPACE",
  is_loading: false,
  error: "",
  locations: {} as any,
  session: null,
};

interface UpdateSignInSessionFieldPayload {
  field: keyof SignInSession;
  value: SignInSession[keyof SignInSession];
}

const initialState = defaultSignInState;

const signInSlice = createSlice({
  name: "signin",
  initialState: initialState,
  reducers: {
    setActiveLocation: (state, action: PayloadAction<LocationName>) => {
      state.active_location = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.is_loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setLocations: (state, action: PayloadAction<{ [KeyT in LocationName]: PartialLocation }>) => {
      state.locations = action.payload;
    },
    clearError: (state) => {
      state.error = "";
    },
    setSignInSession: (state, action: PayloadAction<SignInSession>) => {
      state.session = action.payload;
    },
    updateSignInSessionField: {
      reducer: (state, action: PayloadAction<UpdateSignInSessionFieldPayload>) => {
        if (state.session) {
          const { field, value } = action.payload;
          state.session[field] = value as never;
        }
      },
      prepare: (field: UpdateSignInSessionFieldPayload["field"], value: UpdateSignInSessionFieldPayload["value"]) => ({
        payload: { field, value },
      }),
    },
    resetSignInSession: (state) => {
      state.session = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_APP, () => initialState);
  },
});

export const { actions: signinActions, reducer: signinReducer } = signInSlice;

export const useSignInSessionField = <KeyT extends keyof SignInSession>(
  field: KeyT,
): SignInSession[KeyT] | undefined => {
  return useSelector((state: RootState) => state.signin.session?.[field]) as any;
};
