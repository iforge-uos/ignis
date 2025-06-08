import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import SignInActionsManager from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInManager";
import { FlowType } from "@/types/signInActions";
import Title from "@/components/title";
import { createFileRoute } from "@tanstack/react-router";

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

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/actions/register")({
  component: RegisterComponent,
});
