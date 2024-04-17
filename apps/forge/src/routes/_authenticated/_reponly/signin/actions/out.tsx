import { createFileRoute, redirect } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager";
import { FlowType } from "@/components/signin/actions/SignInManager/types.ts";
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
  component: OutComponent,
});
