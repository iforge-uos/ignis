import { QueueEntry, SignInEntry } from "@packages/types/sign_in";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { MessageSquareWarningIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import { Hammer } from "@/components/loading";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { useUserRoles } from "@/hooks/useUserRoles";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants";
import { orpc } from "@/lib/orpc";
import { SignInDrawer } from "/src/routes/_authenticated/_reponly/sign-in.$location/dashboard/-components/SignInDrawer";
import { QueuedDrawer } from "./-components/QueuedDraw";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";

function SignInDashboard() {
  const [activeLocation] = useAtom(activeLocationAtom);

  const [signedInUsers, setSignedInUsers] = useState<SignInEntry[]>([]);
  const [queuedUsers, setQueuedUsers] = useState<QueueEntry[]>([]);
  const [signedInReps, setSignedInReps] = useState<SignInEntry[]>([]);
  const [signInOffShiftReps, setSignInOffShiftReps] = useState<SignInEntry[]>([]);
  const isUserAdmin = useUserRoles().includes("admin");

  const {
    data: location,
    isLoading,
    isError,
    error,
  } = useQuery(
    orpc.locations.get.experimental_liveOptions({
      input: { name: activeLocation },
    }),
  );

  useEffect(() => {
    if (location) {
      setQueuedUsers(location.queued);

      const usersSignedIn: SignInEntry[] = [];
      const repsSignedIn: SignInEntry[] = [];
      const offShiftRepsSignedIn: SignInEntry[] = [];
      for (const entry of location.sign_ins) {
        if (entry.user.__typename === "users::Rep") {
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
  }, [location]);
  const onShiftReps = signedInReps.map((entry) => entry.user);
  console.log("Hi console")
  const { data: reasons } = useQuery(orpc.signIns.reasons.all.experimental_liveOptions());
  console.log("This is fucked?")
  const repOnShiftReason = reasons?.find((reason) => reason.name === REP_ON_SHIFT);
  const repOffShiftReason = reasons?.find((reason) => reason.name === REP_OFF_SHIFT);

  return (
    <>
      <Title prompt="Sign In Dashboard" />
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
                  supportsSorting
                />
              </div>
              <div id="queue-shelf" className="mt-4 flex-1">
                <QueuedDrawer entries={queuedUsers} />
              </div>
            </div>
          )}
          {isLoading && <Hammer />}
          {isError && (
            <Alert variant="destructive">
              <MessageSquareWarningIcon  className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was an error fetching the sign-in data. Please try again later...
                <br />
                {error.toString()}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/$location/dashboard/")({
  component: SignInDashboard,
  beforeLoad: ({ params: { location } }) => {
      try {
        const name = LocationNameSchema.parse(location.toUpperCase());
        return { name };
      } catch {
        throw redirect({to: "/sign-in/$location", params: { location: "MAINSPACE" } });
      }
    },
});
