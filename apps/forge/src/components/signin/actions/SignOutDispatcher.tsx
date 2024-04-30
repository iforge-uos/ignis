import { AppDispatch, AppRootState } from "@/redux/store.ts";
import { PostSignOut, PostSignOutProps } from "@/services/signin/signInService.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";
import { useDispatch, useSelector } from "react-redux";

import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { signinActions } from "@/redux/signin.slice.ts";
import { FlowStepComponent } from "@/types/signInActions.ts";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button.tsx";
import { Loader } from "@ui/components/ui/loader.tsx";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SignOutDispatcher: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const queryClient = useQueryClient();

  const dispatch: AppDispatch = useDispatch();
  const signInSession = useSelector((state: AppRootState) => state.signin.session);
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const abortController = new AbortController(); // For gracefully cancelling the query
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const navigate = useNavigate();

  const signOutProps: PostSignOutProps = {
    locationName: activeLocation,
    uCardNumber: signInSession?.ucard_number ?? "",
    signal: abortController.signal,
  };

  const { isPending, error, mutate } = useMutation({
    mutationKey: ["postSignOut", signOutProps],
    mutationFn: () => PostSignOut(signOutProps),
    retry: 0,
    onError: (error) => {
      console.log("Error", error);
      abortController.abort();
    },
    onSuccess: () => {
      setCanContinue(true);
      abortController.abort();
      dispatch(signinActions.resetSignInSession());
      queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
      toast.success("User signed out successfully!");
      navigate({ to: "/signin" });
    },
  });

  const successDisplay = (
    <>
      <div className="flex justify-items-center justify-center">
        <h1 className="text-xl flex-auto">Success!</h1>
        <p className="text-sm">Redirecting...</p>
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
      dispatch(signinActions.resetSignInSession());
    }
  };

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <>
      <Card className="w-[700px]">
        <CardHeader>
          <CardTitle>Signing Out</CardTitle>
        </CardHeader>
        <CardContent>
          {!(canContinue || error || isPending) && (
            <Button onClick={() => mutate()} autoFocus={true} variant="default" className="h-[200px] w-full">
              Sign Out
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

export default SignOutDispatcher;
