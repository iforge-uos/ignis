import { Badge } from "@ui/components/ui/badge.tsx";
import { Ban } from "lucide-react";
import React from "react";

interface QueueStatusProps {
  queue_needed: boolean;
  count_in_queue: number;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ queue_needed, count_in_queue }) => {
  if (!queue_needed) {
    return (
      <Badge variant="destructive" className="text-lg">
        <Ban />
        <span className="ml-2">QUEUE DISABLED</span>
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="text-lg">
      <span>{count_in_queue}</span>
      <span className="ml-2">IN QUEUE</span>
    </Badge>
  );
};
