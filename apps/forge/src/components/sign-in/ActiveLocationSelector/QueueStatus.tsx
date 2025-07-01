import { cn } from "@/lib/utils";
import { Badge } from "@packages/ui/components/badge";
import { Ban } from "lucide-react";
import React from "react";

interface QueueStatusProps {
  needs_queue: boolean;
  queued: number;
  className?: string;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ needs_queue, queued, className }) => {
  if (!needs_queue) {
    return (
      <Badge variant="destructive" className={cn("text-lg", className)}>
        <Ban />
        <span className="ml-2">QUEUE DISABLED</span>
      </Badge>
    );
  }
  return (
    <Badge variant="success" className={cn("text-lg", className)}>
      <span>{queued}</span>
      <span className="ml-2">IN QUEUE</span>
    </Badge>
  );
};
