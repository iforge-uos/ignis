import ActiveLocationSelector from "@/components/signin/ActiveLocationSelector";
import { SignInDrawer } from "@/components/signin/dashboard/components/SignInDrawer.tsx";
import { SignedInUserCard } from "@/components/signin/dashboard/components/SignedInUserCard";
import Title from "@/components/title";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants";
import { extractError } from "@/lib/utils";
import { AppRootState } from "@/redux/store.ts";
import { dataForLocation } from "@/services/signin/locationService.ts";
import type { QueueEntry, SignInEntry } from "@ignis/types/sign_in";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { Loader } from "@ui/components/ui/loader.tsx";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PartialUserWithTeams } from "@ignis/types/users.ts";

export default function SignInDashboard() {
  const queryClient = useQueryClient();
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const [signedInUsers, setSignedInUsers] = useState<SignInEntry[]>([]);
  const [queuedUsers, setQueuedUsers] = useState<QueueEntry[]>([]);
  const [signedInReps, setSignedInReps] = useState<SignInEntry[]>([]);
  const [signInOffShiftReps, setSignInOffShiftReps] = useState<SignInEntry[]>([]);

  const handleRemoveSignedInUser = (userId: string) => {
    setSignedInUsers((currentUsers) => currentUsers.filter((user) => user.user.id !== userId));
    queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
  };

  const handleRemoveSignedInRep = (userId: string) => {
    setSignedInReps((currentReps) => currentReps.filter((rep) => rep.user.id !== userId));
    queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
  };

  const handleRemoveSignedInOffShiftRep = (userId: string) => {
    setSignInOffShiftReps((currentOffShiftReps) => currentOffShiftReps.filter((rep) => rep.user.id !== userId));
    queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
  };

  const {
    data: locationList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["locationList", activeLocation],
    queryFn: () => dataForLocation(activeLocation),
    staleTime: 5_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (locationList) {
      setQueuedUsers(locationList.queued);

      const usersSignedIn: SignInEntry[] = [];
      const repsSignedIn: SignInEntry[] = [];
      const offShiftRepsSignedIn: SignInEntry[] = [];
      for (const entry of locationList.sign_ins) {
        if (entry.user.teams !== undefined) {
          if (entry.reason.name === REP_ON_SHIFT) {
            repsSignedIn.push(entry);
          } else if (entry.reason.name === REP_OFF_SHIFT) {
            offShiftRepsSignedIn.push(entry);
          } else {
            usersSignedIn.push(entry);
          }
        } else {
          usersSignedIn.push(entry);
        }
      }
      setSignInOffShiftReps(offShiftRepsSignedIn);
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
          {!(isLoading || isError) && (
            <div className="flex flex-col">
              <div id="rep-signin-shelf" className="flex-1 border-b-2 pb-5">
                <SignInDrawer
                  title="On-Shift Reps"
                  onSignOut={handleRemoveSignedInRep}
                  entries={signedInReps}
                  onShiftReps={onShiftReps}
                  startExpanded={true}
                />
              </div>
              <div id="off-shift-rep-signin-shelf" className="flex-1 border-b-2 pb-5">
                <SignInDrawer
                  title="Off-Shift Reps"
                  onSignOut={handleRemoveSignedInOffShiftRep}
                  entries={signInOffShiftReps}
                  onShiftReps={onShiftReps}
                  startExpanded={false}
                />
              </div>
              <div id="user-signin-shelf" className="mt-4 flex-1 border-b-2 pb-5">
                <SignInDrawer
                  title="Users"
                  onSignOut={handleRemoveSignedInUser}
                  entries={signedInUsers}
                  onShiftReps={onShiftReps}
                  startExpanded={true}
                />
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
                      return <SignedInUserCard key={entry.user.id} user={entry.user as PartialUserWithTeams} />;
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
                <br />
                {extractError(error!)}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}
