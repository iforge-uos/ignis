import { Forbidden } from "@/components/routing/Forbidden";
import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager";
import { FlowType } from "@/components/signin/actions/SignInManager/types.ts";
import Title from "@/components/title";
import { createFileRoute, redirect } from "@tanstack/react-router";

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

export const Route = createFileRoute("/_authenticated/_reponly/signin/actions/register")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
    if (!context.auth.user.roles.find((role) => role.name === "Rep")) {
      return <Forbidden />;
    }
  },
  component: RegisterComponent,
});
