import { createFileRoute, } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { FlowType } from "@/types/signInActions";
import SignInActionsManager from "/src/routes/_authenticated/_reponly/sign-in.$location/actions/-components/SignInManager";

const InComponent = () => {
  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Sign in User" />
        <ActiveLocationSelector />
        <SignInActionsManager initialFlow={FlowType.SignIn} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/$location/actions/in")({
  component: InComponent,
});
