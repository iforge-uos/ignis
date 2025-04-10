import { PostSignIn, PostSignInProps } from "@/services/sign_in/signInService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card";
import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { FlowStepComponent } from "@/types/signInActions";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Loader } from "@ui/components/ui/loader";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { activeLocationAtom, resetSessionAtom, sessionAtom } from "@/atoms/signInAppAtoms.ts";

const SignInDispatcher: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const queryClient = useQueryClient();
  const [session] = useAtom(sessionAtom);
  const [activeLocation] = useAtom(activeLocationAtom);
  const [, resetSession] = useAtom(resetSessionAtom);

  const abortController = new AbortController();
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const navigate = useNavigate();
  const timeout = 3000;

  const signInProps: PostSignInProps = {
    locationName: activeLocation,
    uCardNumber: session?.ucard_number ?? "",
    signal: abortController.signal,
    postBody: {
      ucard_number: session?.ucard_number ?? "",
      location: activeLocation,
      reason_id: session?.sign_in_reason?.id ?? "",
      tools: session?.training?.map((training) => training.name) ?? [],
    },
  };

  const { isPending, error, mutate } = useMutation({
    mutationKey: ["postSignIn", signInProps],
    mutationFn: () => PostSignIn(signInProps),
    retry: 0,
    onError: (error) => {
      console.log("Error", error);
      abortController.abort();
    },
    onSuccess: async () => {
      console.log("Success");
      setCanContinue(true);
      abortController.abort();
      resetSession();
      await queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
      await queryClient.invalidateQueries({ queryKey: ["locationList", activeLocation] });
      toast.success("User signed in!");
      await navigate({ to: "/sign-in" });
    },
  });

  const successDisplay = (
    <>
      <div className="flex justify-items-center justify-center">
        <h1 className="text-xl flex-auto">Success!</h1>
        <p className="text-sm">Redirecting to sign-in page in ~{timeout / 1000} seconds...</p>
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

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Signing In</CardTitle>
        </CardHeader>
        <CardContent>
          {!(canContinue || error || isPending) && (
            <Button onClick={() => mutate()} autoFocus={true} variant="outline" className="h-[200px] w-full">
              Sign in
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

export default SignInDispatcher;
