import { UserAvatar } from "@/components/avatar";
import { ManageUserWidget } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/ManageUserWidget.tsx";
import { SignInReasonDisplay } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/SignInReasonDisplay.tsx";
import TeamIcon from "@/components/signin/dashboard/components/TeamIcon.tsx";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants.ts";
import { AppRootState } from "@/redux/store.ts";
import { PostSignOut, PostSignOutProps } from "@/services/signin/signInService.ts";
import type { PartialReason } from "@ignis/types/sign_in.ts";
import type { PartialUserWithTeams } from "@ignis/types/users.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Card } from "@ui/components/ui/card.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";
import { LogOut, Plus } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { format, intervalToDuration } from "date-fns";
import { iForgeEpoch } from "@/config/constants.ts";

interface SignInUserCardProps {
  user: PartialUserWithTeams;
  tools?: string[];
  reason?: PartialReason;
  timeIn?: Date;
  onSignOut?: () => void;
  onShiftReps?: PartialUserWithTeams[];
  isAdmin?: boolean;
}

export const SignedInUserCard: React.FunctionComponent<SignInUserCardProps> = ({
  user,
  tools,
  reason,
  timeIn,
  onSignOut,
  onShiftReps,
  isAdmin = false,
}) => {
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const [duration, setDuration] = React.useState<string>("");
  const abortController = new AbortController();
  const queryClient = useQueryClient();

  const signOutProps: PostSignOutProps = {
    locationName: activeLocation,
    uCardNumber: user.ucard_number,
    signal: abortController.signal,
  };

  const { mutate } = useMutation({
    mutationKey: ["postSignOut", signOutProps],
    mutationFn: () => PostSignOut(signOutProps),
    retry: 0,
    onError: (error) => {
      console.error("Error", error);
      abortController.abort();
    },
    onSuccess: () => {
      abortController.abort();
      toast.success(`Successfully signed out ${user.display_name}`);
      onSignOut?.();
      queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
    },
  });

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (timeIn) {
        const now = new Date();
        const durationObj = intervalToDuration({ start: timeIn, end: now });
        const newDuration = `${durationObj.hours ?? 0}h ${durationObj.minutes ?? 0}m ${durationObj.seconds ?? 0}s`;
        setDuration(newDuration);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeIn]);

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      mutate();
    }
  };

  const shouldDisplayReason = !(reason?.name === REP_ON_SHIFT || reason?.name === REP_OFF_SHIFT);

  // Timezone for the output
  const formattedTime = format(timeIn ?? iForgeEpoch, "HH:mm:ss");

  return (
    <Card className="bg-card w-[240px] md:w-[300px] p-4 rounded-sm flex flex-col justify-between text-black dark:text-white">
      <div>
        <div className="flex items-center justify-between mb-4 w-full space-x-2">
          <div className="w-2/3 p-1 flex-col">
            <Link to={`/users/${user.id}` as string}>
              <h2 className="text-center text-lg font-bold hover:underline">{user.display_name}</h2>
            </Link>
            <div>
              {user.teams.map((team) => (
                <Badge
                  key={team.name}
                  variant="team"
                  className="flex items-center justify-start rounded-sm pt-1.5 pb-1.5"
                >
                  <div className="flex gap-1 w-full text-center">
                    <TeamIcon team={team.name} className="stroke-black dark:stroke-white mr-1 h-4 w-4" />
                    <p className="w-full text-xs">{team.name}</p>
                  </div>
                </Badge>
              ))}
            </div>
          </div>
          <div className="w-1/3 aspect-square">
            <UserAvatar user={user} className="w-full h-full aspect-square" />
          </div>
        </div>
      </div>
      {isAdmin && (
        <div className="flex mb-4 items-center justify-between w-full flex-col gap-2 border-2 border-accent border-dashed p-2 ">
          <div className="gap-2 flex">
            <Badge variant="success" className="rounded-sm shadow-md flex-col">
              <span className="text-accent-foreground">UCard Number</span> <span>XXX-{user.ucard_number}</span>
            </Badge>
            <Badge variant="success" className="rounded-sm shadow-md flex-col">
              <span className="text-accent-foreground">Username</span> <span>{user.username}</span>
            </Badge>
          </div>

          <Badge variant="success" className="rounded-sm shadow-md flex-col">
            <span className="text-accent-foreground">Email</span> <span>{user.email}@sheffield.ac.uk</span>
          </Badge>
        </div>
      )}
      <div className="flex-grow">
        {shouldDisplayReason ? <SignInReasonDisplay tools={tools!} reason={reason!} /> : undefined}
      </div>
      <div className="py-4 border-t border-gray-700 flex justify-between space-x-4">
        <div className="flex justify-between w-full gap-2">
          <div className="flex">
            <Badge variant="info" className="rounded-sm shadow-md flex-col w-[90px]">
              <span className="text-accent-foreground">Time In:</span> <span>{formattedTime}</span>
            </Badge>
          </div>
          <div className="flex">
            <Badge variant="info" className="rounded-sm shadow-md flex-col w-[120px]">
              <span className="text-accent-foreground text-xs">Duration:</span> <span>{duration}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700 flex justify-between">
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="warning" disabled={!onShiftReps}>
                    <Plus className="stroke-warning-foreground" />
                    <span className="text-warning-foreground ml-1.5">Add</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <TooltipContent>Add in-person training and infractions.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="mt-2 ml-2 w-[350px] shadow-xl border-2 border-gray-200 dark:border-gray-700">
            <ManageUserWidget user={user} onShiftReps={onShiftReps ?? []} location={activeLocation} />
          </PopoverContent>{" "}
        </Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSignOut} variant="destructive">
                <LogOut />
                <span className="ml-1.5">Sign Out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out User from the Active Location</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};
