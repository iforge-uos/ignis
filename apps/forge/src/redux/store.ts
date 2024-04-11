import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {appReducer} from '@/redux/app/app.slice';
import {authReducer} from '@/redux/auth/auth.slice';
import {userReducer} from '@/redux/user/user.slice';
import storage from 'redux-persist/lib/storage';
import {persistReducer, persistStore} from 'redux-persist';
import {signinReducer} from "@/redux/signin/signin.slice.ts";
import {AppState} from "@/redux/app/app.types.ts";
import {AuthState} from "@/redux/auth/auth.types.ts";
import {UserState} from "@/redux/user/user.types.ts";
import {SignInState} from "@/redux/signin/signin.types.ts";

export interface AppRootState {
    app: AppState
    auth: AuthState,
    user: UserState,
    signin: SignInState,
}

const rootReducer = combineReducers({
    app: appReducer,
    auth: authReducer,
    user: userReducer,
    signin: signinReducer,
});


const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user', 'app', 'signin'],
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
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export const persistor = persistStore(store);

if (import.meta.hot) {
    import.meta.hot.accept(
        [
            "./user/user.slice",
            "./app/app.slice",
            "./auth/auth.slice",
            "./signin/signin.slice",
        ],
        async () => {
            const newRootReducer = combineReducers({
                user: (await import("./user/user.slice")).userReducer,
                app: (await import("./app/app.slice")).appReducer,
                auth: (await import("./auth/auth.slice")).authReducer,
                signin: (await import("./signin/signin.slice")).signinReducer,
            });

            store.replaceReducer(persistReducer(persistConfig, newRootReducer));
        }
    );
}


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
