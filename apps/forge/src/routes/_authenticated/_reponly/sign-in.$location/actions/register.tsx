import { createFileRoute, } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { FlowType } from "@/types/signInActions";
import SignInActionsManager from "/src/routes/_authenticated/_reponly/sign-in.$location/actions/-components/SignInManager";

const RegisterComponent = () => {
  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Register User" />
        <ActiveLocationSelector />
        <SignInActionsManager initialFlow={FlowType.Register} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/$location/actions/register")({
  component: RegisterComponent,
});
