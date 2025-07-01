import { createFileRoute } from "@tanstack/react-router"
import Title from "@/components/title";
import { client, orpc } from "@/lib/orpc";
import { MailingList } from "@ignis/types/notifications";
import { Button } from "@packages/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@packages/ui/components/dialog";
import { Input } from "@packages/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {} from "@tanstack/react-router";
import { Mail, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

const updateMailingList = async (list: MailingList) => {
  // No operation
};

const deleteMailingList = async (id: string) => {
  // No operation
};

const createMailingList = async (list: Pick<MailingList, "name" | "description">) => {
  // No operation
};

// TODO
// - email
// - add users to one
// - implement above functions
// - reps
// teams
// view/edit a notif

const NotificationDashboard = () => {
  const lists = Route.useLoaderData();
  const [editingList, setEditingList] = useState<string | null>(null);
  const [newList, setNewList] = useState<Pick<MailingList, "name" | "description">>({ name: "", description: "" });
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateMailingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailing-lists"] });
      setEditingList(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMailingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailing-lists"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createMailingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailing-lists"] });
      setNewList({ name: "", description: "" });
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Title prompt="Mailing Lists Dashboard" />
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Mailing List</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="List Name"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
              />
              <Button onClick={() => createMutation.mutate(newList)}>Create List</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Subscribers</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists?.map((list) => (
            <TableRow key={list.id}>
              <TableCell>
                {editingList === list.id ? (
                  <Input
                    value={list.name}
                    onChange={(e) => {
                      const updatedLists = lists.map((l) => (l.id === list.id ? { ...l, name: e.target.value } : l));
                      queryClient.setQueryData(["mailing-lists"], updatedLists);
                    }}
                  />
                ) : (
                  list.name
                )}
              </TableCell>
              <TableCell>
                {editingList === list.id ? (
                  <Input
                    value={list.description}
                    onChange={(e) => {
                      const updatedLists = lists.map((l) =>
                        l.id === list.id ? { ...l, description: e.target.value } : l,
                      );
                      queryClient.setQueryData(["mailing-lists"], updatedLists);
                    }}
                  />
                ) : (
                  list.description
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {list.subscribers?.length || 0}
                </div>
              </TableCell>
              <TableCell>{new Date(list.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(list.updated_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {editingList === list.id ? (
                  <Button onClick={() => updateMutation.mutate(list)}>Save</Button>
                ) : (
                  <Button variant="ghost" onClick={() => setEditingList(list.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" onClick={() => deleteMutation.mutate(list.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost">
                  <Mail className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const Route = createFileRoute("/_authenticated/admin/notifications/dashboard")({
  component: NotificationDashboard,
  loader: async () => client.notifications.mailingLists.all({ include_subscribers: false }),
});
