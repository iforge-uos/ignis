import { notification } from "@packages/db/interfaces";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { Plus, Send } from "lucide-react";
import { Fragment, useMemo } from "react";
import { getColumns } from "./columns";

interface NotificationListProps {
  notifications: notification.AuthoredNotification[];
  onSend: (id: string) => void;
  onEdit: (notification: notification.AuthoredNotification) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  statusFilter: notification.Status[];
  setIsCreateDialogOpen: (isOpen: boolean) => void;
}

export function NotificationList({
  notifications,
  onSend,
  onEdit,
  onDelete,
  searchTerm,
  statusFilter,
  setIsCreateDialogOpen,
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
