import { notification } from "@packages/db/interfaces";
import { StatusSchema } from "@packages/db/zod/modules/notification";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Input } from "@packages/ui/components/input";
import MultipleSelector from "@packages/ui/components/multi-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { Filter, Plus, Search, Send } from "lucide-react";
import { Fragment, useMemo } from "react";
import { toTitleCase } from "@/lib/utils";
import { getColumns } from "./columns";

interface NotificationListProps {
  notifications: notification.AuthoredNotification[];
  onSend: (id: string) => void;
  onEdit: (notification: notification.AuthoredNotification) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: notification.Status[];
  onStatusFilterChange: (status: notification.Status[]) => void;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  onAddNew: () => void;
}

export function NotificationList({
  notifications,
  onSend,
  onEdit,
  onDelete,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  setIsCreateDialogOpen,
  onAddNew,
}: NotificationListProps) {
  const columns = useMemo(
    () => getColumns(onEdit, onDelete, onSend),
    [onEdit, onDelete, onSend],
  );

  const table = useReactTable({
    data: notifications,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Notifications</CardTitle>
        <CardDescription>Manage your email notifications and announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-4 -mt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <MultipleSelector
              onChange={(options) => onStatusFilterChange(options.map((option) => option.value) as notification.Status[])}
              options={Object.keys(StatusSchema.enum).map((status) => ({
                label: toTitleCase(status),
                value: status,
              }))}
              className="pl-9"
              placeholder="Filter by status..."
            />
          </div>
          <Button onClick={onAddNew} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Create notification
          </Button>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <div className="p-2 text-sm text-muted-foreground">{row.original.content}</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Send className="h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-foreground">No notifications found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter.length > 0
                          ? "Try adjusting your search or filter criteria."
                          : "Create your first notification to get started."}
                      </p>
                      {!searchTerm && statusFilter.length === 0 && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create notification
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
