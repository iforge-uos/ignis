import { activeLocationAtom, resetSessionAtom, sessionAtom } from "@/atoms/signInAppAtoms";
import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { orpc } from "@/lib/orpc";
import { FlowStepComponent } from "@/types/signInActions";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import Loader from "@packages/ui/components/loader";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";

const QueueDispatcher: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const [session] = useAtom(sessionAtom);
  const [activeLocation] = useAtom(activeLocationAtom);
  const [, resetSession] = useAtom(resetSessionAtom);

  const abortController = new AbortController();
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const navigate = useNavigate();
  const timeout = 3000;

  const { isPending, error, mutate } = useMutation(orpc.locations.queue.add.mutationOptions({
    onError: (error) => {
      console.log("Error", error);
      abortController.abort();
    },
    onSuccess: () => {
      console.log("Success");
      setCanContinue(true);
      abortController.abort();
      resetSession();
      toast.success("User added to queue successfully");
      navigate({ to: "/sign-in" });
    },
  }));

  const successDisplay = (
    <>
      <div className="flex justify-items-center justify-center">
        <h1 className="text-xl flex-auto">Success!</h1>
        <p className="text-sm">Possibly redirecting to actions page in ~{timeout / 1000} seconds...</p>
      </div>
    </>
  );

  const handleSecondaryClick = () => {
    abortController.abort();
    onSecondary?.();
  };

  const handlePrimaryClick = () => {
    if (canContinue) {
      abortController.abort();
      onPrimary?.();
      console.log("Done ");
      resetSession();
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Adding User to Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {!(canContinue || error || isPending) && (
            <Button onClick={() => mutate({name: activeLocation})} autoFocus={true} variant="outline" className="h-[200px] w-full">
              Join Queue
            </Button>
          )}
          {isPending && <Loader />}
          {!isPending && error && !canContinue && errorDisplay({ error })}
          {!isPending && canContinue && successDisplay}
        </CardContent>
        <CardFooter className="flex justify-between flex-row-reverse">
          <Button onClick={handlePrimaryClick} disabled={!canContinue}>
            Continue
          </Button>
          <Button onClick={handleSecondaryClick} variant="outline">
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default QueueDispatcher;
