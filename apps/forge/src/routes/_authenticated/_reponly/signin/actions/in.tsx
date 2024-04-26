import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager";
import { FlowType } from "@/components/signin/actions/SignInManager/types.ts";
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

export const Route = createFileRoute("/_authenticated/_reponly/signin/actions/in")({
  component: InComponent,
});
