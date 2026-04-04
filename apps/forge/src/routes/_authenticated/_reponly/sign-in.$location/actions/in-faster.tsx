import { createFileRoute, } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { FlowType } from "@/types/signInActions";
import SignInActionsManager from "/src/routes/_authenticated/_reponly/sign-in.$location/actions/-components/SignInManager";

const OutComponent = () => {
  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Signout User" />
        <ActiveLocationSelector />
        <SignInActionsManager initialFlow={FlowType.SignIn} initialStep={SignInSteps.Step2} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/$location/actions/in-faster")({
  component: OutComponent,
});
