import { createFileRoute } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager.tsx";
import { FlowType } from "@/types/signInActions.ts";
import Title from "@/components/title";

const EnqueueComponent = () => {
  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Enqueue User" />
        <ActiveLocationSelector />
        <SignInActionsManager initialFlow={FlowType.Enqueue} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/signin/actions/enqueue")({
  component: EnqueueComponent,
});
