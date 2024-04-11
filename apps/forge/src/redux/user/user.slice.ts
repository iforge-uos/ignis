import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESET_APP } from "@/redux/common/common.types";
import { UserState } from "@/redux/user/user.types.ts";
import { User } from "@ignis/types/users";

const initialState: UserState = {
  user: null,
  is_loading: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_APP, () => initialState);
  },
});

export const { actions: userActions, reducer: userReducer } = userSlice;
