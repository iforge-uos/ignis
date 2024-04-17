import { createFileRoute, redirect } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager";
import { FlowType } from "@/components/signin/actions/SignInManager/types.ts";
import Title from "@/components/title";

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
  component: InComponent,
});
