import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/redux/auth.slice.ts";
import { userReducer } from "@/redux/user.slice.ts";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { signinReducer } from "@/redux/signin.slice.ts";
import { AuthState } from "@/types/auth.ts";
import { UserState } from "@/types/user.ts";
import { SignInState } from "@/types/signin.ts";

export interface AppRootState {
  auth: AuthState;
  user: UserState;
  signin: SignInState;
}

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  signin: signinReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "app", "signin", "auth"],
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Define Store
export const store = configureStore({
  reducer: persistedReducer,
  // WARN This could maybe be investigated to see if ignoring it is fully okay
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export const persistor = persistStore(store);

if (import.meta.hot) {
  import.meta.hot.accept(
    ["./user/user.slice", "./app/app.slice", "./auth/auth.slice", "./signin/signin.slice"],
    async () => {
      const newRootReducer = combineReducers({
        user: (await import("./user.slice.ts")).userReducer,
        auth: (await import("./auth.slice.ts")).authReducer,
        signin: (await import("./signin.slice.ts")).signinReducer,
      });

      store.replaceReducer(persistReducer(persistConfig, newRootReducer));
    },
  );
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
