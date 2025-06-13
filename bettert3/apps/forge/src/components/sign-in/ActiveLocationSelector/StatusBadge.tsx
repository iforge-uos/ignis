import { cn } from "@/lib/utils";
import { Separator } from "@packages/ui/components/separator";
import { Moon } from "lucide-react";
import React from "react";

interface StatusBadgeProps {
  is_open: boolean;
  is_out_of_hours: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ is_open, is_out_of_hours, className }) => {
  return (
    <div className={cn("rounded-sm flex bg-card text-card-foreground p-2 space-x-2", className)}>
      <span className="text-gray-500 dark:text-gray-400">Status</span>
      {is_open ? <span className="text-green-500">OPEN</span> : <span className="text-red-500">CLOSED</span>}
      {is_out_of_hours && (
        <>
          <Separator orientation="vertical" />
          <Moon /> <span>Out of Hours</span>
        </>
      )}
    </div>
  );
};
