import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@packages/ui/components/button";
import { Card } from "@packages/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@packages/ui/components/tabs";
import { useState } from "react";
import * as z from "zod";
import { Hammer } from "@/components/loading";
import { formatRemaining } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";
import { FileIcon } from "lucide-react";

const QUEUE_TABS = [
  { value: "QUEUED", label: "Queued" },
  { value: "REVIEW", label: "Under Review" },
  { value: "HISTORY", label: "Print History" },
] as const;

type QueueTab = (typeof QUEUE_TABS)[number]["value"];

const PAGE_SIZE = 20;

export const Route = createFileRoute("/_authenticated/printing/user/queue")({
  component: RouteComponent,
  validateSearch: z.object({
    tab: z.enum(["QUEUED", "REVIEW", "HISTORY"]).default("QUEUED"),
  }),
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<QueueTab>(tab);
  const [offset, setOffset] = useState(0);

  const { data, isPending, error } = useQuery(
    orpc.print.public.users.prints.queryOptions({ input: { type: activeTab, offset } }),
  );

  const changeTab = (value: QueueTab) => {
    setActiveTab(value);
    setOffset(0);
  };

  const isHistory = activeTab === "HISTORY";

  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          <FileIcon className="size-8" />
          Your 3d prints at the University of Sheffield's iForge.
        </h2>
      </div>
      <div className="p-6">
        <Card className="gap-0 overflow-hidden p-0">
          <Tabs value={activeTab} onValueChange={(value) => changeTab(value as QueueTab)} className="gap-0">
            <TabsList className="w-full rounded-none rounded-t-xl">
              {QUEUE_TABS.map(({ value, label }) => (
                <TabsTrigger key={value} value={value}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6">
              {isPending ? (
                <div className="flex justify-center p-6">
                  <Hammer />
                </div>
              ) : error ? (
                <div className="p-6">Failed to load prints: {error.message}</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">No prints</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[900px] table-fixed [&_td]:text-center [&_th]:text-center">
                        <TableHeader>
                          <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                            <TableHead>#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Queue</TableHead>
                            <TableHead>Mass</TableHead>
                            <TableHead>Duration</TableHead>
                            {!isHistory && <TableHead>Lead time</TableHead>}
                            {!isHistory && <TableHead>Position</TableHead>}
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.map((row, i) => (
                            <TableRow key={row.id}>
                              <TableCell className="text-muted-foreground">{offset + i + 1}</TableCell>
                              <TableCell className="font-medium">
                                <div className="truncate" title={row.print.name}>
                                  {row.print.name}
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{row.print.priority.toLowerCase()}</TableCell>
                              <TableCell>{row.queue}</TableCell>
                              <TableCell>{row.print.mass}g</TableCell>
                              <TableCell>{formatRemaining(row.print.duration.total({ unit: "seconds" }))}</TableCell>
                              {!isHistory && (
                                <TableCell>{formatRemaining(row.lead_time.total({ unit: "seconds" }))}</TableCell>
                              )}
                              {!isHistory && <TableCell>{row.position}</TableCell>}
                              <TableCell className="capitalize">{row.status.state}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {(offset > 0 || data.length === PAGE_SIZE) && (
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={offset === 0}
                        onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.length < PAGE_SIZE}
                        onClick={() => setOffset((o) => o + PAGE_SIZE)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
