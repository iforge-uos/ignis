import { CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSignIn } from "@/providers/SignInSteps";
import { FlowStepComponent } from "@/types/signInActions";

export const SignOut: FlowStepComponent<"SIGN_OUT"> = ({ user }) => {
  const { finalise } = useSignIn<"SIGN_OUT">(async (transmit) => {
    const t = toast.loading("Loading...");
    const { error } = await transmit({});
    if (error) {
      toast.error(
        <>
          <Link
            className="font-bold hover:underline underline-offset-4 hover:cursor-pointer"
            to="/users/$id"
            params={user}
          >
            {user.display_name}
          </Link>
          <br />
          {error.toString()}
        </>,
        { id: t },
      );
      return;
    } else {
      toast.success(
        <>
          Successfully signed out{" "}
          <Link className="hyperlink font-bold" to="/users/$id" params={user}>
            {user.display_name}
          </Link>
        </>,
        { id: t },
      );
      return;
    }
  });

  useEffect(() => {
    if (finalise) finalise();
  }, [finalise]);

  return (
    <CardHeader>
      <CardTitle>Sign-Out Finalising</CardTitle>
      <CardDescription>Signing out user...</CardDescription>
    </CardHeader>
  );
};
