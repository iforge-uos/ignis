import { createFileRoute } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/routes/_authenticated/_reponly/signin/actions/-components/SignInManager.tsx";
import { FlowType } from "@/types/signInActions.ts";
import Title from "@/components/title";

const OutComponent = () => {
  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Signout User" />
        <ActiveLocationSelector />
        <SignInActionsManager initialFlow={FlowType.SignOut} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/signin/actions/out")({
  component: OutComponent,
});
