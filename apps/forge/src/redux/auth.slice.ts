import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESET_APP } from "@/types/common.ts";
import { AuthState } from "@/types/auth.ts";

// Define initial state based on persisted state or default values
const initialState: AuthState = {
  redirect: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setRedirect: (state, action: PayloadAction<string>) => {
      state.redirect = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_APP, () => initialState);
  },
});

export const { actions: authActions, reducer: authReducer } = authSlice;
