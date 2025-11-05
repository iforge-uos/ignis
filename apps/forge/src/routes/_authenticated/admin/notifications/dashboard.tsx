import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@packages/ui/components/empty";
import { Input } from "@packages/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@packages/ui/components/input-group";
import { Label } from "@packages/ui/components/label";
import { useDebounce } from "@packages/ui/components/multi-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { Textarea } from "@packages/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowLeft, Bell, Edit, Eye, Mail, Plus, Search, Trash2, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { client, orpc } from "@/lib/orpc";
import { Procedures } from "@/types/router";

type MailingList = Procedures["notifications"]["mailingLists"]["get"]

export default function AdminDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<MailingList | null>(null);
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Get all mailing lists for admin dashboard
  const { data: allMailingLists } = useSuspenseQuery(
    orpc.notifications.mailingLists.all.queryOptions({
      input: { include_subscribers: true },
    }),
  );

  // Search API call - only enabled when there's a debounced search term
  const { data: searchResults, isLoading: isSearching } = useQuery({
    ...orpc.notifications.mailingLists.search.queryOptions({
      input: { query: debouncedSearchTerm, limit: 20 },
    }),
    enabled: debouncedSearchTerm.length > 0,
  });

  const { mutate: deleteMailingList } = useMutation({
    mutationFn: async (id: string) => client.notifications.mailingLists.remove({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notifications.mailingLists.all.queryKey({ input: { include_subscribers: true } }),
      });
    },
  });

  const { mutate: createMailingList, isPending: isCreating } = useMutation({
    mutationFn: async (data: { name: string; description: string }) => client.notifications.mailingLists.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notifications.mailingLists.all.queryKey({ input: { include_subscribers: true } }),
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
  });

  const { mutate: updateMailingList, isPending: isUpdating } = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) =>
      client.notifications.mailingLists.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notifications.mailingLists.all.queryKey({ input: { include_subscribers: true } }),
      });
      setIsEditDialogOpen(false);
      setEditingList(null);
      editForm.reset();
    },
  });

  // Create form using TanStack Form
  const createForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      createMailingList(value);
    },
  });

  // Edit form using TanStack Form
  const editForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      if (editingList) {
        updateMailingList({
          id: editingList.id,
          ...value,
        });
      }
    },
  });

  const handleDelete = useCallback(
    (id: string) => {
      deleteMailingList(id);
    },
    [deleteMailingList],
  );

  const handleEdit = useCallback(
    (list: MailingList) => {
      setEditingList(list);
      editForm.setFieldValue("name", list.name);
      editForm.setFieldValue("description", list.description);
      setIsEditDialogOpen(true);
    },
    [editForm],
  );

  // Column definitions for TanStack Table
  const columns = useMemo<ColumnDef<MailingList>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const list = row.original;
          return (
            <div>
              <p className="font-medium text-foreground">{list.name}</p>
              <p className="text-sm text-muted-foreground truncate max-w-xs">{list.description}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "subscribers",
        header: "Subscribers",
        cell: ({ row }) => {
          const subscriberCount = row.original.subscribers?.length || 0;
          return (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{subscriberCount.toLocaleString()}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: "Last Updated",
        cell: ({ row }) => {
          const updatedAt = row.original.updated_at;
          return (
            <span className="text-muted-foreground">
              {updatedAt ? new Date(updatedAt).toLocaleDateString() : "Never"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const list = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Navigate to detailed view - you can implement this with router navigation
                  console.log("View list:", list.id);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(list)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(list.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDelete, handleEdit],
  );

  // Determine which mailing lists to display
  const displayedLists: MailingList[] = useMemo(() => {
    if (isSearching) {
      return [];
    }
    if (debouncedSearchTerm.length === 0) {
      return (allMailingLists || []);
    }

    if (!searchResults) {
      return [];
    }

    const searchResultIds = new Set(searchResults.map((result) => result.id));
    return (allMailingLists || []).filter((list) => searchResultIds.has(list.id));
  }, [debouncedSearchTerm, isSearching, searchResults, allMailingLists]);

  // Create the table instance
  const table = useReactTable({
    data: displayedLists,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalSubscribers = (allMailingLists || []).reduce(
    (sum, list) => sum + ((list as MailingList).subscribers?.length || 0),
    0,
  );
  const activeLists = (allMailingLists || []).length; // All lists are considered active since there's no status field

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage all mailing lists</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSubscribers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeLists}</p>
                  <p className="text-sm text-muted-foreground">Total Lists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{(allMailingLists || []).length}</p>
                  <p className="text-sm text-muted-foreground">Total Lists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-destructive" />
                <div>
                  <Link to="/admin/notifications">
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mailing Lists Table */}
        <Card>
          <CardHeader className="grid grid-cols-3 gap-2 items-start">
            <div>
              <CardTitle className="mb-1">Mailing Lists</CardTitle>
              <CardDescription>Manage all your mailing lists</CardDescription>
            </div>
            <div className="flex items-center">
              <InputGroup className="flex-1 w-fit">
                <InputGroupInput
                  placeholder="Search mailing lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex justify-end w-auto">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create List
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Mailing List</DialogTitle>
                    <DialogDescription>Create a new mailing list to organize your email campaigns.</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      createForm.handleSubmit();
                    }}
                  >
                    <div className="space-y-4">
                      <createForm.Field
                        name="name"
                        validators={{
                          onChange: ({ value }) =>
                            !value
                              ? "Name is required"
                              : value.length < 2
                                ? "Name must be at least 2 characters"
                                : undefined,
                        }}
                        children={(field) => (
                  <div className="space-y-2">
                            <Label htmlFor={field.name}>Name</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              placeholder="Enter list name"
                            />
                            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-destructive-foreground">{field.state.meta.errors.join(", ")}</p>
                            )}
                          </div>
                        )}
                      />
                      <createForm.Field
                        name="description"
                        validators={{
                          onChange: ({ value }) =>
                            !value
                              ? "Description is required"
                              : value.length < 10
                                ? "Description must be at least 10 characters"
                                : undefined,
                        }}
                        children={(field) => (
                  <div className="space-y-2">
                            <Label htmlFor={field.name}>Description</Label>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              placeholder="Enter list description"
                              rows={3}
                            />
                            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-destructive-foreground">{field.state.meta.errors.join(", ")}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <createForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                          <Button type="submit" disabled={!canSubmit || isCreating}>
                            {isCreating || isSubmitting ? "Creating..." : "Create List"}
                          </Button>
                        )}
                      />
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="-mt-3">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="px-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}  className="px-4">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}  className="px-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24">
                        {isSearching ? (
                          <Empty className="border-0">
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <Mail />
                              </EmptyMedia>
                              <EmptyTitle>Searching...</EmptyTitle>
                              <EmptyDescription>Finding mailing lists that match your search</EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        ) : (
                          <Empty className="border-0">
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <Mail />
                              </EmptyMedia>
                              <EmptyTitle>No mailing lists found</EmptyTitle>
                              <EmptyDescription>
                                {debouncedSearchTerm.length > 0
                                  ? "Try adjusting your search terms or create a new list"
                                  : "Create your first mailing list to get started"}
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mailing List</DialogTitle>
            <DialogDescription>Update the details of your mailing list.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editForm.handleSubmit();
            }}
          >
            <div className="space-y-4">
              <editForm.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Name is required" : value.length < 2 ? "Name must be at least 2 characters" : undefined,
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter list name"
                      autoComplete="off"
                      pushPasswordManagerStrategy="none"
                      data-lpignore="true"
                      data-1p-ignore="true"
                    />
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive-foreground">{field.state.meta.errors.join(", ")}</p>
                    )}
                  </div>
                )}
              />
              <editForm.Field
                name="description"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Description is required"
                      : value.length < 10
                        ? "Description must be at least 10 characters"
                        : undefined,
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Description</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter list description"
                      rows={3}
                    />
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                    )}
                  </div>
                )}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <editForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isUpdating}>
                    {isUpdating || isSubmitting ? "Updating..." : "Update List"}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/notifications/dashboard")({
  component: AdminDashboardPage,
});
