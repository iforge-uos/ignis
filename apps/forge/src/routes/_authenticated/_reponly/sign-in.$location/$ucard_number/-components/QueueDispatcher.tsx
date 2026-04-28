import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { Hammer } from "@/components/loading";
import { FlowStepComponent } from "@/types/signInActions";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { useSignIn } from "/src/providers/SignInSteps";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Queue: FlowStepComponent<"QUEUE"> = () => {
  const navigate = useNavigate();
  useSignIn<"QUEUE">(async (transmit) => {
    const { data, error } = await transmit({});
    if (error) {
      toast.error(error.message);
      return;
    }

    data?.place; // TODO optimistic rendering
    return await navigate({ to: "/sign-in/$location/dashboard", params: { location: data.place.location.name } });
  });

  return (
    <>
      <CardHeader>
        <CardTitle>Adding User to Queue</CardTitle>
      </CardHeader>
      <CardContent>{/* TODO maybe give a guess of how long it'll be? */}</CardContent>
    </>
  );
};
