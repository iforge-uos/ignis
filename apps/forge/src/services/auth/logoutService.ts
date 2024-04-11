import {AppDispatch, persistor} from "@/redux/store.ts";
import { authActions } from "@/redux/auth/auth.slice.ts";
import {userActions} from "@/redux/user/user.slice.ts";
import axiosInstance from "@/api/axiosInstance.ts";
import {toast} from "sonner";
import {useNavigate} from "@tanstack/react-router";
import {useAuth} from "@/components/auth-provider";

const logout = async (dispatch: AppDispatch) => {
    const auth = useAuth();
    const navigate = useNavigate()
    try {
        await axiosInstance.post('/authentication/logout');

        await persistor.purge();
        dispatch(userActions.clearUser());
        dispatch(authActions.onLogout());
        auth.logout()
        // stops component from hanging here and trying again
        toast.success("Logged out successfully.");
        await navigate({to: "/"});
    } catch (error) {
        console.error('Logout failed:', error);
        toast.error("Logout failed.");

    }
    await navigate({to: "/"});
};

export const logoutService = {
    logout,
};