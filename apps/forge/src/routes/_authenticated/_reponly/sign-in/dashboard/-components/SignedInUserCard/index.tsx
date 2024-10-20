import { UserAvatar } from "@/components/avatar";
import { TeamIcon } from "@/components/icons/Team.tsx";
import { iForgeEpoch } from "@/config/constants.ts";
import { REP_OFF_SHIFT, REP_ON_SHIFT } from "@/lib/constants.ts";
import { uCardNumberToString } from "@/lib/utils.ts";
import { AppRootState } from "@/redux/store.ts";
import { AdminDisplay } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/AdminDisplay.tsx";
import { ManageUserWidget } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/ManageUserWidget.tsx";
import { SignInReasonWithToolsDisplay } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/SignInReasonDisplay.tsx";
import { TimeDisplay } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/TimeDisplay.tsx";
import { GetSignIn, PatchSignIn, PostSignOut, PostSignOutProps } from "@/services/sign_in/signInService";
import type { LocationName, PartialReason, User } from "@ignis/types/sign_in.ts";
import type { PartialUserWithTeams } from "@ignis/types/users.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Card } from "@ui/components/ui/card.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";
import { Edit, LogOut, Plus } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import SignInReasonInput from "../../../actions/-components/SignInReasonInput";
import { ToolSelectionDisplay } from "../../../actions/-components/ToolSelectionDisplay";
import ToolSelectionInput from "../../../actions/-components/ToolSelectionInput";

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
  const activeLocation = useSelector((state: AppRootState) => state.signIn.active_location);
  const abortController = new AbortController();
  const queryClient = useQueryClient();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);

  const signOutProps: PostSignOutProps = {
    locationName: activeLocation,
    uCardNumber: uCardNumberToString(user.ucard_number),
    signal: abortController.signal,
  };

  const { mutate: signOutMutate } = useMutation({
    mutationKey: ["postSignOut", signOutProps],
    mutationFn: () => PostSignOut(signOutProps),
    retry: 0,
    onError: (error) => {
      console.error("Error", error);
      abortController.abort();
    },
    onSuccess: () => {
      abortController.abort();
      toast.success(
        <>
          Successfully signed out{" "}
          <a className="font-bold hover:underline underline-offset-4 hover:cursor-pointer" href={`/users/${user.id}`}>
            {user.display_name}
          </a>
        </>,
      );
      onSignOut?.();
      queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
    },
  });

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      signOutMutate();
    }
  };
  const { mutate: updateSignInMutate } = useMutation({
    mutationKey: ["patchSignIn", user.ucard_number],
    mutationFn: (postBody: { tools?: string[]; reason?: PartialReason }) =>
      PatchSignIn({
        locationName: activeLocation,
        uCardNumber: uCardNumberToString(user.ucard_number),
        signal: abortController.signal,
        postBody,
      }),
    onSuccess: () => {
      toast.success("Successfully updated user sign-in information");
      queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
      setIsUpdateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating sign-in information", error);
      toast.error("Failed to update user sign-in information");
    },
  });

  const { data: userData, isLoading: isUserDataLoading } = useQuery<User>({
    queryKey: ["getSignIn", user.ucard_number],
    queryFn: () =>
      GetSignIn({
        locationName: activeLocation,
        uCardNumber: uCardNumberToString(user.ucard_number),
        signal: abortController.signal,
        params: { fast: true },
      }),
    enabled: isUpdateDialogOpen,
  });

  const handleUpdateSignIn = (newTools: string[], newReason: PartialReason) => {
    updateSignInMutate({ tools: newTools, reason: newReason });
  };

  const shouldDisplayReason = !(reason?.name === REP_ON_SHIFT || reason?.name === REP_OFF_SHIFT);

  return (
    <Card className="bg-card w-[240px] md:w-[300px] p-4 rounded-sm flex flex-col justify-between text-black dark:text-white">
      <div>
        <div className="flex items-center justify-between mb-4 w-full space-x-2">
          <div className="w-2/3 p-1 flex-col">
            <Link to="/users/$id" params={user}>
              <h2 className="text-center text-lg font-bold hover:underline underline-offset-4">{user.display_name}</h2>
            </Link>
            <div>
              {user.teams?.map((team) => (
                <Badge
                  key={team.name}
                  variant="team"
                  className="flex items-center justify-start rounded-sm pt-1.5 pb-1.5 mt-2"
                >
                  <div className="flex gap-1 w-full text-center items-center">
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
      {isAdmin && <AdminDisplay user={user} />}
      <div className="flex-grow">
        {shouldDisplayReason ? (
          <SignInReasonWithToolsDisplay tools={tools!} reason={reason!} key={user.id} />
        ) : undefined}
      </div>
      <TimeDisplay timeIn={timeIn ?? iForgeEpoch} />
      <div className="pt-4 border-t border-gray-700 flex justify-between">
        <AddUserAttributes onShiftReps={onShiftReps!} user={user} activeLocation={activeLocation} />
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogTrigger asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="mr-2">
                    <Edit className="mr-2 h-4 w-4" />
                    Update
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update user's tools and sign-in reason</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Sign-In Information</DialogTitle>
            </DialogHeader>
            {isUserDataLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                {userData && (
                  <ToolSelectionDisplay
                    trainingMap={{
                      SELECTABLE: userData?.training.filter((t) => t.selectable === true),
                      UNSELECTABLE: userData?.training.filter((t) => t.selectable === false),
                      DISABLED: userData?.training.filter((t) => t.selectable === undefined),
                    }}
                    onTrainingSelect={(newTools) =>
                      handleUpdateSignIn(
                        newTools.map((t) => t.name),
                        reason!,
                      )
                    }
                  />
                )}
                <SignInReasonInput
                  initialReason={reason}
                  onReasonChange={(newReason) => handleUpdateSignIn(tools!, newReason)}
                />
              </>
            )}
          </DialogContent>
        </Dialog>
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

export function AddUserAttributes({
  onShiftReps,
  user,
  activeLocation,
}: { onShiftReps: PartialUserWithTeams[] | undefined; user: PartialUserWithTeams; activeLocation: LocationName }) {
  return (
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
        <ManageUserWidget user={user} onShiftReps={onShiftReps ?? []} locationName={activeLocation} />
      </PopoverContent>
    </Popover>
  );
}
