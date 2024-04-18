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
}

export const SignedInUserCard: React.FunctionComponent<SignInUserCardProps> = ({
  user,
  tools,
  reason,
  timeIn,
  onSignOut,
  onShiftReps,
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
    <Card className="bg-card w-[240px] md:w-[300px] p-4 rounded-lg flex flex-col justify-between text-black dark:text-white">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="mt-1 ml-1">
            <Link to={`/users/${user.id}` as string}>
              <h2 className="w-full text-center text-lg font-bold hover:underline">{user.display_name}</h2>
            </Link>
            {user.teams.map((team) => (
              <Badge
                key={team.name}
                className="flex items-center justify-start rounded-sm bg-accent dark:bg-neutral-800 m-0.5 w-full pt-1.5 pb-1.5 text-black dark:text-white"
              >
                <TeamIcon team={team.name} className="stroke-black dark:stroke-white mr-1 h-4 w-4" />
                <p className="text-left ml-2 text-xs">{team.name}</p>
              </Badge>
            ))}
          </div>
          <UserAvatar user={user} className="h-16 w-16 " />
        </div>
      </div>
      <div className="pt-4 flex-grow">
        {shouldDisplayReason ? <SignInReasonDisplay tools={tools!} reason={reason!} /> : undefined}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
        <div className="flex justify-between w-full">
          <div className="flex">
            <Badge variant="info" className="rounded-sm shadow-md flex-col">
              <span className="text-accent-foreground">Time In:</span> <span>{formattedTime}</span>
            </Badge>
          </div>
          <div className="flex">
            <p className="px-5" />
          </div>
          <div className="flex">
            <Badge variant="info" className="rounded-sm shadow-md flex-col">
              <span className="text-accent-foreground">Time Spent In:</span> <span>{duration}</span>
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="warning" disabled={!onShiftReps}>
                    <Plus className="stroke-white" />
                    <span className="text-white ml-1.5">Add</span>
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
