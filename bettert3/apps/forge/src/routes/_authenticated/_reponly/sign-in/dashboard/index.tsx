import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { useSignInReasons } from "@/hooks/useSignInReasons";
import { useUserRoles } from "@/hooks/useUserRoles";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants";
import { orpc } from "@/lib/orpc";
import { extractError } from "@/lib/utils";
import { SignInDrawer } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignInDrawer";
import type { QueueEntry, SignInEntry } from "@ignis/types/sign_in";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import Loader from "@packages/ui/components/loader";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {} from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { QueuedDrawer } from "./-components/QueuedDraw";

function SignInDashboard() {
  const queryClient = useQueryClient();
  const [activeLocation] = useAtom(activeLocationAtom);

  const [signedInUsers, setSignedInUsers] = useState<SignInEntry[]>([]);
  const [queuedUsers, setQueuedUsers] = useState<QueueEntry[]>([]);
  const [signedInReps, setSignedInReps] = useState<SignInEntry[]>([]);
  const [signInOffShiftReps, setSignInOffShiftReps] = useState<SignInEntry[]>([]);
  const isUserAdmin = useUserRoles().includes("admin");

  const {
    data: locationList,
    isLoading,
    isError,
    error,
  } = useQuery(
    orpc.locations.get.queryOptions({
      input: { name: activeLocation },
      staleTime: 5_000,
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
    }),
  );

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
                  entries={signedInReps}
                  onShiftReps={onShiftReps}
                  startExpanded={true}
                  isAdmin={isUserAdmin}
                  reason={repOnShiftReason}
                  supportsDnd
                />
              </div>
              <div id="off-shift-rep-signin-shelf" className="flex-1 border-b-2 pb-5">
                <SignInDrawer
                  title="Off-Shift Reps"
                  entries={signInOffShiftReps}
                  onShiftReps={onShiftReps}
                  startExpanded={false}
                  isAdmin={isUserAdmin}
                  reason={repOffShiftReason}
                  supportsDnd
                />
              </div>
              <div id="user-signin-shelf" className="mt-4 flex-1 border-b-2 pb-5">
                <SignInDrawer
                  title="Users"
                  entries={signedInUsers}
                  onShiftReps={onShiftReps}
                  startExpanded={true}
                  isAdmin={isUserAdmin}
                />
              </div>
              <div id="queue-shelf" className="mt-4 flex-1">
                <QueuedDrawer entries={queuedUsers} />
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

export const Route = createFileRoute({
  component: SignInDashboard,
});
