import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Input } from "@packages/ui/components/input";
import { useDebounce } from "@packages/ui/components/multi-select";
import { Switch } from "@packages/ui/components/switch";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Calendar, Loader2, Mail, Search, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Title from "@/components/title";
import { useUser } from "@/hooks/useUser";
import { orpc } from "@/lib/orpc";

function RouteComponent() {
  const user = useUser()!;
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Get all available mailing lists
  const { data: allMailingLists } = useSuspenseQuery(
    orpc.notifications.mailingLists.all.queryOptions({
      input: { include_subscribers: false },
    }),
  );

  // Get user's subscription status for all lists
  const { data: subscriptions } = useSuspenseQuery(
    orpc.users.mailingLists.subscriptions.queryOptions({
      input: { id: user.id },
    }),
  );

  const { data: searchResults, isLoading: isSearching } = useQuery({
    ...orpc.notifications.mailingLists.search.queryOptions({
      input: { query: debouncedSearchTerm, limit: 20 },
    }),
    enabled: debouncedSearchTerm.length > 0,
  });

  const { mutate: subscribe } = useMutation({
    ...orpc.users.mailingLists.subscribe.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.users.mailingLists.subscriptions.queryKey({ input: { id: user.id } }),
      });
    },
  });

  const { mutate: unsubscribe } = useMutation({
    ...orpc.users.mailingLists.unsubscribe.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.users.mailingLists.subscriptions.queryKey({ input: { id: user.id } }),
      });
    },
  });

  const handleSubscriptionToggle = (mailingListId: string, isCurrentlySubscribed: boolean | null) => {
    if (isCurrentlySubscribed) {
      unsubscribe({ id: user.id, mailing_list_id: mailingListId });
    } else {
      subscribe({ id: user.id, mailing_list_id: mailingListId });
    }
  };

  // Determine which mailing lists to display
  const displayedMailingLists = useMemo(() => {
    if (isSearching) {
      return [];
    }

    const subscriptionMap = new Map(subscriptions.map((sub) => [sub.id, sub.is_subscribed]));

    const searchResultIds = searchResults ? new Set(searchResults.map((result) => result.id)) : null;
    const filteredLists = searchResults
      ? allMailingLists.filter((list) => searchResultIds!.has(list.id))
      : allMailingLists;

    return filteredLists.map((list) => ({
      ...list,
      is_subscribed: subscriptionMap.get(list.id) ?? false,
    }));
  }, [isSearching, searchResults, allMailingLists, subscriptions]);

  const activeSubscriptions = subscriptions.filter((sub) => sub.is_subscribed).length;

  return (
    <>
      <Title prompt="Mailing Lists" />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Mailing Lists</h1>
            <p className="text-muted-foreground">Discover and manage your mailing list subscriptions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{activeSubscriptions}</p>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {(() => {
                        const allLists = Array.isArray(allMailingLists)
                          ? allMailingLists
                          : allMailingLists
                            ? [allMailingLists]
                            : [];
                        return allLists.length;
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">Available Lists</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-accent-foreground" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {(() => {
                        const allLists = Array.isArray(allMailingLists)
                          ? allMailingLists
                          : allMailingLists
                            ? [allMailingLists]
                            : [];
                        return allLists.length - activeSubscriptions;
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">Unsubscribed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>Browse Mailing Lists</CardTitle>
              <CardDescription>Search and subscribe to available mailing lists</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search mailing lists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
                  )}
                </div>
              </div>

              {/* Mailing List Cards */}
              <div className="grid gap-4">
                {displayedMailingLists.map((mailingList) => (
                  <Card key={mailingList.id} className="hover:shadow-sm transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{mailingList.name}</CardTitle>
                            <Badge variant={mailingList.is_subscribed ? "default" : "secondary"}>
                              {mailingList.is_subscribed ? "Subscribed" : "Not Subscribed"}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">{mailingList.description}</CardDescription>
                        </div>
                        <Switch
                          checked={mailingList.is_subscribed ?? false}
                          onCheckedChange={() => handleSubscriptionToggle(mailingList.id, mailingList.is_subscribed)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Updated: {mailingList.updated_at.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {displayedMailingLists.length === 0 && !isSearching && (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No mailing lists found</h3>
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm.length > 0
                      ? "Try adjusting your search terms"
                      : "No mailing lists are currently available"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/user/mailing-lists")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(orpc.users.mailingLists.subscriptions.queryOptions({ input: context.user }));
    context.queryClient.prefetchQuery(
      orpc.notifications.mailingLists.all.queryOptions({ input: { include_subscribers: false } }),
    );
  },
  component: RouteComponent,
});
