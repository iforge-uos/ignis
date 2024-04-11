import {createFileRoute, redirect} from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/signin/actions/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager";
import Title from "@/components/title";

const SignInAppIndexComponent = () => {
    return (
        <>
            <div className="p-4 mt-1">
                <Title prompt="Signin Manager"/>
                <ActiveLocationSelector/>
                <SignInActionsManager/>
            </div>
        </>
    )
};

export const Route = createFileRoute('/_authenticated/_reponly/signin/actions/')({
    beforeLoad: ({ context, location }) => {
        if (!context.auth.user?.roles.find(role => role.name === "Rep")) {
            throw redirect({
                to: '/auth/login',
                search: {
                    redirect: location.href,
                },
            })
        }
    },
    component: SignInAppIndexComponent
});