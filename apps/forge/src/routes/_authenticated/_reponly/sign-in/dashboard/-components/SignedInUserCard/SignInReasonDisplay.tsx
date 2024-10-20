import { uCardNumberToString } from "@/lib/utils";
import { AppRootState } from "@/redux/store";
import { SignInReason } from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInReason.tsx";
import { GetSignIn, PatchSignIn } from "@/services/sign_in/signInService";
import { PartialReason, Training, User } from "@ignis/types/sign_in.ts";
import { PartialUserWithTeams } from "@ignis/types/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Button } from "@ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { Edit } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ToolSelectionDisplay } from "../../../actions/-components/ToolSelectionDisplay";

interface SignInReasonWithToolsDisplayProps {
  tools: string[]; // FIXME after machines branch is done this should just be training
  reason: PartialReason;
  user: PartialUserWithTeams;
}

export const SignInReasonWithToolsDisplay: React.FC<SignInReasonWithToolsDisplayProps> = ({ user, tools, reason }) => {
  const activeLocation = useSelector((state: AppRootState) => state.signIn.active_location);
  const abortController = new AbortController();
  const queryClient = useQueryClient();

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [tools_, setTools] = React.useState(tools);
  tools = tools_;
  const [newTools, setNewTools] = React.useState<string[] | undefined>();
  const [newReason, setNewReason] = React.useState<PartialReason>();

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
      setTools(newTools!);
      setIsUpdateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating sign-in information", error);
      toast.error("Failed to update user sign-in information");
    },
  });

  const toolsForSelection = React.useMemo(() => {
    if (tools) return userData?.training.filter((training) => tools.includes(training.name));
  }, [tools, userData]);

  const handleUpdateSignIn = (newTools?: string[], newReason?: PartialReason) => {
    updateSignInMutate({ tools: newTools, reason: newReason });
    setIsUpdateDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <div className="my-4 p-4 bg-muted text-muted-foreground rounded-sm h-[90%]">
          <div className="border-gray-500 p-2 rounded-sm mb-2">
            <div className="pb-2 bg-card h-full w-2/3 mr-auto ml-auto rounded-lg p-2 font-medium mb-1 text-center font-mono">
              Sign In Reason
            </div>
            <SignInReason reason={reason} />
          </div>
          <div className="border-gray-500 p-2 rounded-sm mb-4">
            <div className="pb-2 bg-card w-2/3 mr-auto ml-auto rounded-sm p-1 font-medium mb-1 text-center font-mono">
              Tools Used
            </div>
            <div className="flex flex-wrap gap-1 mt-2 justify-center">
              {/* {toolsForSelection
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((tool) => (
                <Badge variant="default" className="max-w-48 rounded-sm shadow-lg text-center" key={tool.id}>
                {tool.name}
                </Badge>
                ))} */}
              {tools.sort().map((tool) => (
                <Badge variant="default" className="max-w-48 rounded-sm shadow-lg text-center" key={tool}>
                  {tool}
                </Badge>
              ))}
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 h-6 text-xs"
                        onClick={() => setIsUpdateDialogOpen(true)}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Update
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Update user's tools</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
            </div>
          </div>
        </div>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Sign-In Information</DialogTitle>
          </DialogHeader>
          {isUserDataLoading ? (
            <div>Loading...</div>
          ) : (
            userData && (
              <>
                <ToolSelectionDisplay
                  trainingMap={{
                    SELECTABLE: userData?.training.filter((t) => t.selectable === true),
                    UNSELECTABLE: userData?.training.filter((t) => t.selectable === false),
                    DISABLED: userData?.training.filter((t) => t.selectable === undefined),
                  }}
                  onTrainingSelect={(newTools) => setNewTools(newTools.map((t) => t.name))}
                  initialSelection={toolsForSelection?.map((t) => t.id)}
                />

                <Button onClick={() => handleUpdateSignIn(newTools, newReason)} disabled={newTools?.length === 0}>
                  Finish update
                </Button>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
