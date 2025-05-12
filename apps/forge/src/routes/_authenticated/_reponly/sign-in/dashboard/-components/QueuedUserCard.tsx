import { activeLocationAtom } from "@/atoms/signInAppAtoms.ts";
import { UserAvatar } from "@/components/avatar";
import { iForgeEpoch } from "@/config/constants";
import { useUserRoles } from "@/hooks/useUserRoles.ts";
import { DeleteQueue } from "@/services/sign_in/queueService";
import { QueueEntry } from "@ignis/types/sign_in";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Card } from "@ui/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { useAtom } from "jotai";
import { Delete } from "lucide-react";
import { toast } from "sonner";
import { AdminDisplay } from "./SignedInUserCard/AdminDisplay";
import { TimeDisplay } from "./SignedInUserCard/TimeDisplay";
import {intervalToDuration } from "date-fns";

interface QueuedUserCardProps {
  place: QueueEntry;
  onDequeue?: (user_id: string) => void;
}

export const QueuedUserCard: React.FC<QueuedUserCardProps> = ({ place, onDequeue }) => {
  const isAdmin = useUserRoles().includes("admin");
  const [activeLocation] = useAtom(activeLocationAtom);
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
    onSuccess: async () => {
      abortController.abort();
      toast.success(`Successfully signed out ${place.user.display_name}`);
      onDequeue?.(place.user.id);
      await queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
      await queryClient.invalidateQueries({ queryKey: ["locationList", activeLocation] });
    },
  });

  const handleDequeue = () => {
    if (window.confirm("Are you sure you want to remove this user from the queue?")) {
      mutate();
    }
  };

  const canSignIn = place.ends_at?.getTime() ?? Number.NEGATIVE_INFINITY > new Date().getTime();

  const now = new Date();
  const durationObj = intervalToDuration({ start: place.ends_at ?? place.created_at, end: now});
  const newDurationValue = (durationObj.hours ?? 0) * 60 * 60 + (durationObj.minutes ?? 0) * 60 + (durationObj.seconds ?? 0);

  return (
    <Card className="bg-card w-[240px] md:w-[300px] p-4 rounded-sm flex flex-col justify-between text-black dark:text-white">
      <div>
        <div className="flex items-center justify-between mb-4 w-full space-x-2">
          <div className="w-2/3 p-1 flex-col">
            <Link to="/users/$id" params={place.user}>
              <h2 className="text-center text-lg font-bold hover:underline underline-offset-4">
                {place.user.display_name}
              </h2>
            </Link>
          </div>
          <div className="w-1/3 aspect-square">
            <UserAvatar user={place.user} className="w-full h-full aspect-square" />
          </div>
        </div>
      </div>
      {isAdmin && <AdminDisplay user={place.user} />}
      <div className="my-4 p-4 bg-muted text-muted-foreground rounded-sm h-[90%]">
        <div className="border-gray-500 p-2 rounded-sm mb-2">
          <div
            className={`pb-2 h-full w-2/3 mr-auto ml-auto rounded-lg p-2 font-medium mb-1 text-center font-mono ${
              canSignIn ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {canSignIn ? "Can" : "Cannot"} sign in
          </div>
        </div>
      </div>
      <TimeDisplay timeIn={place.ends_at ?? place.created_at} inText="Queued at:" durationText={canSignIn ? newDurationValue > 0 ? "Overdue By:" : "Time Left:" : "Queuing for:"} />
      <div className="pt-4 border-t border-gray-700 flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleDequeue} variant="destructive" className="flex-grow">
              <div className="flex items-center">
                <Delete />
                <span className="ml-1.5">Dequeue</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove the user from the queue</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
};
