import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import SignInActionsManager from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInManager.tsx";
import { FlowType } from "@/types/signInActions.ts";
import Title from "@/components/title";
import { createFileRoute } from "@tanstack/react-router";

const InComponent = () => {
  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Signin User" />
        <ActiveLocationSelector />
        <SignInActionsManager initialFlow={FlowType.SignIn} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/actions/in")({
  component: InComponent,
});
