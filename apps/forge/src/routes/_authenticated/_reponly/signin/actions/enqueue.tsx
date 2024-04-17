import { createFileRoute, redirect } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager";
import { FlowType } from "@/components/signin/actions/SignInManager/types.ts";
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
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user?.roles.find((role) => role.name === "Rep")) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: EnqueueComponent,
});
