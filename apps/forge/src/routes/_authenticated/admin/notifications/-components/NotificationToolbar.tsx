import { notification } from "@packages/db/interfaces";
import { StatusSchema } from "@packages/db/zod/modules/notification";
import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";
import MultipleSelector from "@packages/ui/components/multi-select";
import { Filter, Plus, Search } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import { getStatusIcon } from "./columns";
import z from "zod";

interface NotificationToolbarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: notification.Status[];
  onStatusFilterChange: (status: notification.Status[]) => void;
  onAddNew: () => void;
}

export function NotificationToolbar({
  searchTerm,
  onSearchTermChange,
  onStatusFilterChange,
  onAddNew,
}: NotificationToolbarProps) {
  return (
    <div className="md:grid sm:flex-col grid-cols-6 space-y-1 items-center justify-end mb-6">
      <div className="relative px-2 col-span-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <div className="relative px-2 col-span-3">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <MultipleSelector
          onChange={(options) => onStatusFilterChange(options.map((option) => option.value) as notification.Status[])}
          options={Object.keys(StatusSchema.enum).map((status) => ({
            label: toTitleCase(status),
            value: status,
          }))}
          className="w-full pl-10"
          placeholder="Filter by status..."
        />
      </div>
      <Button onClick={onAddNew} className="w-fit px-2 ml-2">
        <Plus className="mr-2 h-4 w-4" />
        Create notification
      </Button>
    </div>
  );
}
