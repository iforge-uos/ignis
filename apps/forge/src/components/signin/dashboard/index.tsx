import ActiveLocationSelector from "@/components/signin/actions/ActiveLocationSelector";
import { SignedInUserCard } from "@/components/signin/dashboard/components/SignedInUserCard.tsx";
import Title from "@/components/title";
import { AppRootState } from "@/redux/store.ts";
import { dataForLocation } from "@/services/signin/locationService.ts";
import { SignInReasonCategorySchema } from "@dbschema/edgedb-zod/modules/sign_in.ts";
import type { QueueEntry, SignInEntry } from "@ignis/types/sign_in";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { Loader } from "@ui/components/ui/loader.tsx";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function SignInDashboard() {
  const queryClient = useQueryClient();
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const [signedInUsers, setSignedInUsers] = useState<SignInEntry[]>([]);
  const [queuedUsers, setQueuedUsers] = useState<QueueEntry[]>([]);
  const [signedInReps, setSignedInReps] = useState<SignInEntry[]>([]);

  const handleRemoveSignedInUser = (userId: string) => {
    setSignedInUsers((currentUsers) => currentUsers.filter((user) => user.user.id !== userId));
    queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
  };

  const handleRemoveSignedInRep = (userId: string) => {
    setSignedInReps((currentReps) => currentReps.filter((rep) => rep.user.id !== userId));
    queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
  };

  const {
    data: locationList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["locationList", activeLocation],
    queryFn: () => dataForLocation(activeLocation),
  });

  useEffect(() => {
    if (locationList) {
      setQueuedUsers(locationList.queued);

      const usersSignedIn: SignInEntry[] = [];
      const repsSignedIn: SignInEntry[] = [];
      for (const entry of locationList.sign_ins) {
        if (entry.reason.category === SignInReasonCategorySchema.Values.REP_SIGN_IN) {
          repsSignedIn.push(entry);
        } else {
          usersSignedIn.push(entry);
        }
      }
      setSignedInUsers(usersSignedIn);
      setSignedInReps(repsSignedIn);
    }
  }, [locationList]);
  const onShiftReps = signedInReps.map((entry) => entry.user);

  return (
    <>
      <Title prompt="Signin Dashboard" />
      <div className="p-4 mt-1">
        <ActiveLocationSelector />
        <div className="border-2 p-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Sign In Dashboard</h1>
          {!isLoading && !isError && (
            <div className="flex flex-col">
              <div id="rep-signin-shelf" className="flex-1 border-b-2">
                <h2 className="text-xl font-bold mb-4">Reps on shift</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  {signedInReps.length === 0 && (
                    <Alert variant="default">
                      <InfoCircledIcon className="h-4 w-4" />
                      <AlertTitle>Info</AlertTitle>
                      <AlertDescription>There are no reps currently signed in.</AlertDescription>
                    </Alert>
                  )}
                  {signedInReps.length > 0 &&
                    signedInReps.map((entry) => {
                      return (
                        <SignedInUserCard
                          key={entry.user.id}
                          user={entry.user}
                          reason={entry.reason}
                          onSignOut={() => handleRemoveSignedInRep(entry.user.id)}
                          onShiftReps={onShiftReps}
                        />
                      );
                    })}
                </div>
              </div>
              <div id="user-signin-shelf" className="mt-4 flex-1 border-b-2">
                <h3 className="text-xl font-bold mb-4">Users Signed In</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                  {signedInUsers.length === 0 && (
                    <Alert variant="default">
                      <InfoCircledIcon className="h-4 w-4" />
                      <AlertTitle>Info</AlertTitle>
                      <AlertDescription>There are no users currently signed in.</AlertDescription>
                    </Alert>
                  )}
                  {signedInUsers.length > 0 &&
                    signedInUsers.map((entry) => {
                      return (
                        <SignedInUserCard
                          key={entry.user.id}
                          user={entry.user}
                          tools={entry.tools}
                          reason={entry.reason}
                          onSignOut={() => handleRemoveSignedInUser(entry.user.id)}
                          onShiftReps={onShiftReps}
                        />
                      );
                    })}
                </div>
              </div>
              <div id="queue-shelf" className="mt-4 flex-1">
                <h4 className="text-xl font-bold mb-4">Queued</h4>
                <div className="flex flex-wrap gap-4 mb-4">
                  {queuedUsers.length === 0 && (
                    <Alert variant="default">
                      <InfoCircledIcon className="h-4 w-4" />
                      <AlertTitle>Info</AlertTitle>
                      <AlertDescription>There are no users currently queued.</AlertDescription>
                    </Alert>
                  )}
                  {queuedUsers.length > 0 &&
                    queuedUsers.map((entry) => {
                      return <SignedInUserCard key={entry.user.id} user={entry.user} />;
                    })}
                </div>
              </div>
            </div>
          )}
          {isLoading && <Loader />}
          {isError && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was an error fetching the sign-in data. Please try again later...
                {error?.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}
