import { UserAvatar } from "@/components/avatar";
import { iForgeEpoch } from "@/config/constants.ts";
import { useUser } from "@/lib/utils.ts";
import { AppRootState } from "@/redux/store.ts";
import { DeleteQueue } from "@/services/signin/queueService.ts";
import { QueueEntry } from "@ignis/types/sign_in.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button.tsx";
import { Card } from "@ui/components/ui/card.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";
import { Delete } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { AdminDisplay } from "./SignedInUserCard/AdminDisplay.tsx";
import { TimeDisplay } from "./SignedInUserCard/TimeDisplay.tsx";

interface QueuedUserCardProps {
  place: QueueEntry;
}

export const QueuedUserCard: React.FC<QueuedUserCardProps> = ({ place }) => {
  const isAdmin = useUser()!.roles.find((role) => role.name === "Admin");
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const abortController = new AbortController();
  const queryClient = useQueryClient();
  const dequeueProps = {
    locationName: activeLocation,
    id: place.id,
  };

  const { mutate } = useMutation({
    mutationKey: ["postDequeue", dequeueProps],
    mutationFn: () => DeleteQueue(dequeueProps),
    retry: 0,
    onError: (error) => {
      console.error("Error", error);
      abortController.abort();
    },
    onSuccess: () => {
      abortController.abort();
      toast.success(`Successfully signed out ${place.user.display_name}`);
      queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
    },
  });

  const handleDequeue = () => {
    if (window.confirm("Are you sure you want to remove this user from the queue?")) {
      mutate();
    }
  };
  return (
    <Card className="bg-card w-[240px] md:w-[300px] p-4 rounded-sm flex flex-col justify-between text-black dark:text-white">
      <div>
        <div className="flex items-center justify-between mb-4 w-full space-x-2">
          <div className="w-2/3 p-1 flex-col">
            <Link to="/users/$id" params={place.user}>
              <h2 className="text-center text-lg font-bold hover:underline">{place.user.display_name}</h2>
            </Link>
          </div>
          <div className="w-1/3 aspect-square">
            <UserAvatar user={place.user} className="w-full h-full aspect-square" />
          </div>
        </div>
      </div>
      {isAdmin && <AdminDisplay user={place.user} />}
      <>
        <div className="my-4 p-4 bg-muted text-muted-foreground rounded-sm h-[90%]">
          <div className="border-gray-500 p-2 rounded-sm mb-2">
            <div
              className={`pb-2 h-full w-2/3 mr-auto ml-auto rounded-lg p-2 font-medium mb-1 text-center font-mono ${
                place.can_sign_in ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {place.can_sign_in ? "Can" : "Cannot"} sign in
            </div>
          </div>
        </div>
      </>
      <TimeDisplay timeIn={place.created_at ?? iForgeEpoch} inText="Queued at:" durationText="Queuing for:" />
      <div className="pt-4 border-t border-gray-700 flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleDequeue} variant="destructive">
                <Delete />
                <span className="ml-1.5">Dequeue</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove the user from the queue</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};
