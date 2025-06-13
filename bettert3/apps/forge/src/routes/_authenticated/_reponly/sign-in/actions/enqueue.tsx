;
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import SignInActionsManager from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInManager";
import { FlowType } from "@/types/signInActions";
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

export const Route = createFileRoute({
  component: EnqueueComponent,
});
