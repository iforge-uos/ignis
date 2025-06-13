import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import SignInActionsManager from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInManager";
import { FlowType } from "@/types/signInActions";
import Title from "@/components/title";
import { } from "@tanstack/react-router";

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

export const Route = createFileRoute({
  component: InComponent,
});
