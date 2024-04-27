import { createFileRoute, redirect } from "@tanstack/react-router";
import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import SignInActionsManager from "@/components/signin/actions/SignInManager.tsx";
import Title from "@/components/title";

const SignInAppIndexComponent = () => {
  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Signin Manager" />
        <ActiveLocationSelector />
        <SignInActionsManager />
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/signin/")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.roles.find((role) => role.name === "Rep")) {
      throw redirect({
        to: "/signin/home",
      });
    }
  },
  component: SignInAppIndexComponent,
});
