import { UserAvatar } from "@/components/avatar";
import { AddToUser } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/AddToUser.tsx";
import { SignInReasonDisplay } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/SignInReasonDisplay.tsx";
import TeamIcon from "@/components/signin/dashboard/components/TeamIcon.tsx";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants.ts";
import { AppRootState } from "@/redux/store.ts";
import { PostSignOut, PostSignOutProps } from "@/services/signin/signInService.ts";
import type { PartialReason, SignInEntry } from "@ignis/types/sign_in.ts";
import type { PartialUser } from "@ignis/types/users.ts";
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

interface SignInUserCardProps {
  user: SignInEntry["user"];
  tools?: string[];
  reason?: PartialReason;
  onSignOut?: () => void;
  onShiftReps?: PartialUser[];
}

export const SignedInUserCard: React.FunctionComponent<SignInUserCardProps> = ({
  user,
  tools,
  reason,
  onSignOut,
  onShiftReps,
}) => {
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
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

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      mutate();
    }
  };

  const shouldDisplayReason = !(reason?.name === REP_ON_SHIFT || reason?.name === REP_OFF_SHIFT);

  return (
    <Card className="bg-card w-[240px] md:w-[300px] p-4 rounded-lg flex flex-col justify-between text-black dark:text-white">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="mt-1 ml-1">
            <Link to={`/users/${user.id}` as string}>
              <h2 className="w-full text-center text-lg font-bold hover:underline">{user.display_name}</h2>
            </Link>
            {user.teams?.map((team) => (
              <Badge className="flex items-center justify-start rounded-sm bg-accent dark:bg-neutral-800 m-0.5 w-full pt-1.5 pb-1.5 text-black dark:text-white">
                <TeamIcon team={team.name} className="stroke-black dark:stroke-white mr-1 h-4 w-4" />
                <text className="text-left ml-2 text-xs">{team.name}</text>
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
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button className="bg-neutral-800" disabled={!onShiftReps}>
                    <Plus className="stroke-white" />
                    <span className="text-white ml-1.5">Add</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <TooltipContent>Add in-person training and infractions.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-350">
            {onShiftReps ? <AddToUser user={user} onShiftReps={onShiftReps} location={activeLocation} /> : undefined}
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
