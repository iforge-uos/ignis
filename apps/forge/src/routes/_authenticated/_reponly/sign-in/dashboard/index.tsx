import { useAuth } from "@/components/auth-provider";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants.ts";
import { extractError } from "@/lib/utils.ts";
import { AppRootState } from "@/redux/store.ts";
import { SignInDrawer } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignInDrawer.tsx";
import { dataForLocation } from "@/services/sign_in/locationService";
import { useSignInReasons } from "@/services/sign_in/signInReasonService";
import type { QueueEntry, SignInEntry } from "@ignis/types/sign_in.ts";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { Loader } from "@ui/components/ui/loader.tsx";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSelector } from "react-redux";
import { QueuedDrawer } from "./-components/QueuedDraw";

export default function SignInDashboard() {
  const queryClient = useQueryClient();
  const activeLocation = useSelector((state: AppRootState) => state.signIn.active_location);
  const [signedInUsers, setSignedInUsers] = useState<SignInEntry[]>([]);
  const [queuedUsers, setQueuedUsers] = useState<QueueEntry[]>([]);
  const [signedInReps, setSignedInReps] = useState<SignInEntry[]>([]);
  const [signInOffShiftReps, setSignInOffShiftReps] = useState<SignInEntry[]>([]);
  const auth = useAuth();

  const isUserAdmin = !!auth.user?.roles.find((role) => role.name === "Admin");

  const handleRemoveSignedInUser = (userId: string) => {
    setSignedInUsers((currentUsers) => currentUsers.filter((signIn) => signIn.user.id !== userId));
    queryClient.invalidateQueries({
      queryKey: ["locationStatus", "locationList", { activeLocation }],
    });
  };

  const handleRemoveSignedInRep = (userId: string) => {
    setSignedInReps((currentReps) => currentReps.filter((signIn) => signIn.user.id !== userId));
    queryClient.invalidateQueries({
      queryKey: ["locationStatus", "locationList", { activeLocation }],
    });
  };

  const handleRemoveSignedInOffShiftRep = (userId: string) => {
    setSignInOffShiftReps((currentOffShiftReps) => currentOffShiftReps.filter((signIn) => signIn.user.id !== userId));
    queryClient.invalidateQueries({
      queryKey: ["locationStatus", "locationList", { activeLocation }],
    });
  };
  const handleDequeue = (userId: string) => {
    setQueuedUsers((currentQueuedUsers) => currentQueuedUsers.filter((place) => place.user.id !== userId));
    queryClient.invalidateQueries({
      queryKey: ["locationStatus", "locationList", { activeLocation }],
    });
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

  const { data: reasons } = useSignInReasons();
  const repOnShiftReason = reasons?.find((reason) => reason.name === REP_ON_SHIFT);
  const repOffShiftReason = reasons?.find((reason) => reason.name === REP_OFF_SHIFT);

  return (
    <>
      <Title prompt="Sign In Dashboard" />
      <div className="p-4 mt-1">
        <DndProvider backend={HTML5Backend}>
          <ActiveLocationSelector />
          <div className="border-2 p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Sign In Dashboard</h1>
            {!(isLoading || isError) && (
              <div className="flex flex-col">
                <div id="rep-sign-in-shelf" className="flex-1 border-b-2 pb-5">
                  <SignInDrawer
                    title="On-Shift Reps"
                    onSignOut={handleRemoveSignedInRep}
                    entries={signedInReps}
                    onShiftReps={onShiftReps}
                    startExpanded={true}
                    isAdmin={isUserAdmin}
                    reason={repOnShiftReason}
                  />
                </div>
                <div id="off-shift-rep-sign-in-shelf" className="flex-1 border-b-2 pb-5">
                  <SignInDrawer
                    title="Off-Shift Reps"
                    onSignOut={handleRemoveSignedInOffShiftRep}
                    entries={signInOffShiftReps}
                    onShiftReps={onShiftReps}
                    startExpanded={false}
                    isAdmin={isUserAdmin}
                    reason={repOffShiftReason}
                  />
                </div>
                <div id="user-sign-in-shelf" className="mt-4 flex-1 border-b-2 pb-5">
                  <SignInDrawer
                    title="Users"
                    onSignOut={handleRemoveSignedInUser}
                    entries={signedInUsers}
                    onShiftReps={onShiftReps}
                    startExpanded={true}
                    isAdmin={isUserAdmin}
                  />
                </div>
                <div id="queue-shelf" className="mt-4 flex-1">
                  <QueuedDrawer entries={queuedUsers} onDequeue={handleDequeue} />
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
        </DndProvider>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/dashboard/")({
  component: SignInDashboard,
});
