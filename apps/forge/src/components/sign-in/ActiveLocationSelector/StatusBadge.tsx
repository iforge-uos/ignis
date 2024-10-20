import { Separator } from "@ui/components/ui/separator.tsx";
import { Moon } from "lucide-react";
import React from "react";

interface StatusBadgeProps {
  is_open: boolean;
  is_out_of_hours: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ is_open, is_out_of_hours }) => {
  return (
    <div className="rounded-sm flex bg-card text-card-foreground p-2 space-x-2">
      <span className="text-gray-500 dark:text-gray-400">Status</span>
      {/* Open Status */}
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
