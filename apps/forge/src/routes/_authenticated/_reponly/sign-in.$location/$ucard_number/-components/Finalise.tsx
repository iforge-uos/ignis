import { CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSignIn } from "@/providers/SignInSteps";
import { FlowStepComponent } from "@/types/signInActions";
import { useSetAtom } from "jotai";
import { sessionAtom } from "/src/atoms/signInAppAtoms";

export const Finalise: FlowStepComponent<"FINALISE"> = ({ user }) => {
  const setSession = useSetAtom(sessionAtom)
  const { finalise } = useSignIn<"FINALISE">(async (transmit) => {
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
      setSession(null)
      toast.success(
        <>
          Successfully signed in{" "}
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
      <CardTitle>Sign-In Finalising</CardTitle>
      <CardDescription>Finalising sign in...</CardDescription>
    </CardHeader>
  );
};
