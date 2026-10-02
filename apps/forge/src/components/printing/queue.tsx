import { QueueTypeSchema } from "@packages/db/zod/modules/printing";
import { Card } from "@packages/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@packages/ui/components/tabs";
import type { ReactNode } from "react";
import type * as z from "zod";
import { Hammer } from "@/components/loading";
import { formatRemaining, TableButtons } from "@/components/printing/utils";
import type { queueHistoryOutput } from "@/lib/printers/utils";

export const MATERIALS = QueueTypeSchema.options;
export type MaterialFilter = (typeof MATERIALS)[number] | "ALL";

export type QueueTabOption = { value: string; label: string };

type QueueRow = z.infer<typeof queueHistoryOutput>[number];

export function PrintQueue({
  title,
  icon,
  tabs,
  activeTab,
  onTabChange,
  material,
  onMaterialChange,
  materialDisabled,
  showLeadPosition,
  emptyMessage,
  data,
  isPending,
  error,
  offset,
  onOffsetChange,
}: {
  title: ReactNode;
  icon: ReactNode;
  tabs: readonly QueueTabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  material: MaterialFilter;
  onMaterialChange: (value: MaterialFilter) => void;
  materialDisabled?: boolean;
  showLeadPosition: boolean;
  emptyMessage: string;
  data: QueueRow[] | undefined;
  isPending: boolean;
  error: { message: string } | null;
  offset: number;
  onOffsetChange: (offset: number) => void;
}) {
  const rows = data ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          {icon}
          {title}
        </h2>
      </div>
      <div className="p-6">
        <Card className="gap-0 relative overflow-hidden p-0">
          <div>
            <Tabs value={activeTab} onValueChange={onTabChange} className="gap-0">
              <TabsList className="w-full rounded-none rounded-t-xl">
                {tabs.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="relative p-6">
                <img
                  src="/homepage/hs-inside.webp"
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 select-none"
                />
                <div className="relative">
                  <div className="mb-4 flex justify-end">
                    <Select
                      value={material}
                      onValueChange={(value) => onMaterialChange(value as MaterialFilter)}
                      disabled={materialDisabled}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All materials</SelectItem>
                        {MATERIALS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {isPending ? (
                    <div className="flex justify-center p-6">
                      <Hammer />
                    </div>
                  ) : error ? (
                    <div className="p-6">Failed to load prints: {error.message}</div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {rows.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">{emptyMessage}</div>
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
                                {showLeadPosition && <TableHead>Lead time</TableHead>}
                                {showLeadPosition && <TableHead>Position</TableHead>}
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rows.map((row, i) => (
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
                                  <TableCell>
                                    {formatRemaining(row.print.duration.total({ unit: "seconds" }))}
                                  </TableCell>
                                  {showLeadPosition && (
                                    <TableCell>{formatRemaining(row.lead_time.total({ unit: "seconds" }))}</TableCell>
                                  )}
                                  {showLeadPosition && <TableCell>{row.position}</TableCell>}
                                  <TableCell className="capitalize">{row.status.state}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      <TableButtons offset={offset} count={rows.length} onOffsetChange={onOffsetChange} />
                    </div>
                  )}
                </div>
              </div>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}
