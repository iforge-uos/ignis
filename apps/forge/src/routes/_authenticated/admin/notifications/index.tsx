import { notification } from "@packages/db/interfaces";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { orpc } from "@/lib/orpc";
import { NotificationDialog } from "./-components/NotificationDialog";
import { NotificationList } from "./-components/NotificationList";
import { NotificationToolbar } from "./-components/NotificationToolbar";

function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useSuspenseQuery(orpc.notifications.all.queryOptions());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<notification.Status[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<notification.AuthoredNotification | null>(null);

  const { mutate: createNotification } = useMutation({
    ...orpc.notifications.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.notifications.all.queryKey() });
      setIsCreateDialogOpen(false);
    },
  });

  const { mutate: updateNotification } = useMutation({
    ...orpc.notifications.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.notifications.all.queryKey() });
      setEditingNotification(null);
    },
  });

  const { mutate: removeNotification } = useMutation({
    ...orpc.notifications.remove.mutationOptions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.notifications.all.queryKey() }),
  });

  const fuse = useMemo(
    () =>
      new Fuse(notifications, {
        keys: ["title", "content", "type"],
        threshold: 0.3,
      }),
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    const searchedNotifications = searchTerm ? fuse.search(searchTerm).map((result) => result.item) : notifications;

    return searchedNotifications.filter(
      (notification) => !statusFilter.length || statusFilter.includes(notification.status),
    );
  }, [notifications, searchTerm, statusFilter, fuse]);

  const handleFormSubmit = (data: any) => {
    if (editingNotification) {
      updateNotification(data);
    } else {
      createNotification(data);
    }
  };

  const handleEditNotification = (notification: notification.AuthoredNotification) => {
    setEditingNotification(notification);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteNotification = (id: string) => {
    removeNotification({ id });
  };

  const handleSendNotification = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      updateNotification({
        ...notification,
        status: "QUEUED",
        dispatched_at: new Date(),
      });
    }
  };

  const handleAddNew = () => {
    setEditingNotification(null);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Manage and send notifications to users.</p>
        </div>
      </div>

      <NotificationToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddNew={handleAddNew}
      />

      <NotificationList
        notifications={filteredNotifications}
        onSend={handleSendNotification}
        onEdit={handleEditNotification}
        onDelete={handleDeleteNotification}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
      />

      <NotificationDialog
        isOpen={isCreateDialogOpen || !!editingNotification}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingNotification(null);
        }}
        onSubmit={handleFormSubmit}
        notification={editingNotification}
      />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/notifications/")({
  component: NotificationsPage,
});
