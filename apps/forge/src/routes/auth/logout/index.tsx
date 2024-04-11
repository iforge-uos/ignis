import {createFileRoute} from "@tanstack/react-router";
import Title from "@/components/title";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/redux/store.ts";
import {logoutService} from "@/services/auth/logoutService.ts";

const LogOutComponent = () => {
    const dispatch: AppDispatch = useDispatch();

    // Call the logout service
    logoutService.logout(dispatch);


    return (
        <>
            <Title prompt="Logout"/>
            <div className="p-2">
                <h3>log out!!!!!!!</h3>
            </div>
        </>
    )
}


export const Route = createFileRoute('/auth/logout/')({
    component: LogOutComponent});
