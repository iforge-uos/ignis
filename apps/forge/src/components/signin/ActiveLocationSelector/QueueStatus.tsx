import React from "react";
import { Ban } from "lucide-react";

interface QueueStatusProps {
  queue_needed: boolean;
  count_in_queue: number;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ queue_needed, count_in_queue }) => {
  if (!queue_needed) {
    return (
      <div className="rounded-sm flex text-primary-foreground bg-green-600 dark:bg-green-900 p-2 space-x-2">
        <Ban />
        <span className="text-white">QUEUE DISABLED</span>
      </div>
    );
  }
  return (
    <div className="rounded-sm flex text-primary-foreground bg-primary p-2 space-x-2">
      <span> {count_in_queue}</span>
      <span>in Queue</span>
    </div>
  );
};
