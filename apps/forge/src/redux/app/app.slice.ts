import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RESET_APP } from "@/redux/common/common.types";
import { Apps, AppState } from "@/redux/app/app.types";


const initialState: AppState = {
  current_app: "Main",
  is_loading: false
};

const appSlice = createSlice({
  name: "app",
  initialState: initialState,
  reducers: {
    setApp: (state, action: PayloadAction<Apps>) => {
      state.current_app = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_APP, () => initialState);
  },
});

export const { actions: appActions, reducer: appReducer } = appSlice;
export const initialAppState = initialState;
