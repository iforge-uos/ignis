import { notification } from "@packages/db/interfaces";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit,
  NotebookPenIcon,
  SearchCheckIcon,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import { priorityToName } from "@/lib/utils/notifications";
import { priorityToColour, priorityToIcon } from "./NotificationDialog";

export const getStatusIcon = (status: notification.Status) => {
  switch (status) {
    case "SENT":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "SENDING":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "QUEUED":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "ERRORED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "DRAFT":
      return <NotebookPenIcon className="h-4 w-4 text-gray-500" />;
    case "REVIEW":
      return <SearchCheckIcon className="h-4 w-4 text-gray-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

export const getColumns = (
  onEdit: (notification: notification.AuthoredNotification) => void,
  onDelete: (id: string) => void,
  onSend: (id: string) => void,
): ColumnDef<notification.AuthoredNotification>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={row.getToggleExpandedHandler()}
              className="h-8 w-8"
              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? "rotate-180" : ""}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Display the contents of the notification</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="hidden md:inline">{toTitleCase(status)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{toTitleCase(row.original.type)}</Badge>,
  },
  {
    accessorKey: "delivery_methods",
    header: "Via",
    cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.delivery_methods.map((method) => (
          <Badge variant="secondary" key={method}>
            {toTitleCase(method)}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          {priorityToIcon(row.original.priority)}
        </TooltipTrigger>
        <TooltipContent>{priorityToName(row.original.priority)}</TooltipContent>
      </Tooltip>
    ),
  },
  {
    accessorKey: "dispatched_at",
    header: "Dispatched",
    cell: ({ row }) => (row.original.dispatched_at ? row.original.dispatched_at.toLocaleString() : "Not sent"),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        {row.original.status === "DRAFT" && (
          <Button variant="outline" size="sm" onClick={() => onSend(row.original.id)}>
            <Send className="h-4 w-4" />
            <span className="hidden lg:inline ml-1">Send</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(row.original)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(row.original.id)}>
          <Trash2 className="h-4 w-4 stroke-destructive-foreground" />
        </Button>
      </div>
    ),
  },
];
