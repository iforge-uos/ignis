import { RESET_APP } from "@/types/common.ts";
import { SignInSession, SignInState } from "@/types/signin.ts";
import { Location, LocationStatus, Reason, Training } from "@ignis/types/sign_in.ts";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type SignInSessionFieldValue = number | null | boolean | Reason | string | Training[];

const defaultSignInState: SignInState = {
  active_location: "mainspace",
  is_loading: false,
  error: "",
  locations: [],
  session: null,
};

interface UpdateSignInSessionFieldPayload {
  field: keyof SignInSession;
  value: SignInSessionFieldValue;
}

const initialState = defaultSignInState;

const signinSlice = createSlice({
  name: "signin",
  initialState: initialState,
  reducers: {
    setActiveLocation: (state, action: PayloadAction<Location>) => {
      state.active_location = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.is_loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setLocations: (state, action: PayloadAction<LocationStatus[]>) => {
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
      prepare: (field: keyof SignInSession, value: SignInSessionFieldValue) => ({
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

export const { actions: signinActions, reducer: signinReducer } = signinSlice;
