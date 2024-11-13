import { signInReducer } from "@/redux/sign_in.slice.ts";
import { SignInState } from "@/types/sign_in.ts";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

export interface AppRootState {
  signIn: SignInState;
}

const rootReducer = combineReducers({
  signIn: signInReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["signIn"],
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
    ["./user/user.slice", "./app/app.slice", "./auth/auth.slice", "./sign_in/sign_in.slice"],
    async () => {
      const newRootReducer = combineReducers({
        signIn: (await import("./sign_in.slice.ts")).signInReducer,
      });

      store.replaceReducer(persistReducer(persistConfig, newRootReducer));
    },
  );
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
