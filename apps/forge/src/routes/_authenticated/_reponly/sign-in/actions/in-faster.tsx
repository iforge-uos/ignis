import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import SignInActionsManager from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInManager.tsx";
import Title from "@/components/title";
import { FlowType, SignInSteps } from "@/types/signInActions";
import { createFileRoute } from "@tanstack/react-router";

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

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/actions/in-faster")({
  component: OutComponent,
});
