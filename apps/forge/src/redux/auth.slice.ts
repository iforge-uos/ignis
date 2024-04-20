import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESET_APP } from "@/types/common.ts";
import { AuthState } from "@/types/auth.ts";

// Define initial state based on persisted state or default values
const initialState: AuthState = {
  is_authenticated: false,
  is_loading: false,
  redirect: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setRedirect: (state, action: PayloadAction<string>) => {
      state.redirect = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.is_loading = action.payload;
    },
    onLogin: (state) => {
      state.is_authenticated = true;
      state.is_loading = false;
    },
    onLogout: (state) => {
      state.is_authenticated = false;
      state.is_loading = false;
      state.redirect = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_APP, () => initialState);
  },
});

export const { actions: authActions, reducer: authReducer } = authSlice;
