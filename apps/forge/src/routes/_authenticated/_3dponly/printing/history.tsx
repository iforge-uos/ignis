import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { HistoryIcon } from "lucide-react";
import { useState } from "react";
import { Hammer } from "@/components/loading";
import {
  formatFailureReason,
  formatMass,
  formatRemaining,
  PrintStatusBadge,
  type SelectedUser,
  TableButtons,
  UserSearch,
} from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/history")({
  component: RouteComponent,
});

type Selector = "PRINTER" | "USER";

const ALL_PRINTERS = "ALL";

function RouteComponent() {
  const [selected, setSelected] = useState<Selector>("PRINTER");
  const [printer_name, setPrinterName] = useState<string>(ALL_PRINTERS);
  const [user, setUser] = useState<SelectedUser | null>(null);
  const [offset, setOffset] = useState(0);

  const { data: printers } = useQuery(orpc.print.list.queryOptions({ input: { location: "ALL" } }));

  const by_user = selected === "USER";
  const all_printers = printer_name === ALL_PRINTERS;

  const all_history = useQuery({
    ...orpc.print.history.all.queryOptions({ input: { offset } }),
    enabled: !by_user && all_printers,
    placeholderData: keepPreviousData,
  });
  const printer_history = useQuery({
    ...orpc.print.history.printer.queryOptions({ input: { name: printer_name, offset } }),
    enabled: !(by_user || all_printers),
    placeholderData: keepPreviousData,
  });
  const user_history = useQuery({
    ...orpc.print.history.user.queryOptions({ input: { id: user?.id ?? "", offset } }),
    enabled: by_user && !!user,
    placeholderData: keepPreviousData,
  });

  const { data, isPending, error } = by_user ? user_history : all_printers ? all_history : printer_history;
  const rows = data ?? [];
  const awaiting_user = by_user && !user;

  const title = (() => {
    if (by_user) return user ? `${user.display_name}'s history:` : "Select a user";
    if (all_printers) return "All print history:";
    return `${printer_name.toLowerCase()}'s history:`;
  })();

  return (
    <>
      <div className="mx-14 mt-8 mb-2 flex flex-wrap items-center gap-6">
        <h2 className="flex items-center gap-2 text-4xl font-futura text-balance">
          <HistoryIcon className="size-8" />
          3DP print history
        </h2>

        <Card className="ml-auto w-full max-w-xl gap-3 py-4 sm:w-[32rem]">
          <CardHeader className="px-4">
            <CardTitle>Browse history</CardTitle>
            <CardDescription>Filter past prints by printer or user.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 px-4">
            <Select
              value={selected}
              onValueChange={(value) => {
                setSelected(value as Selector);
                setOffset(0);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRINTER">Printers</SelectItem>
                <SelectItem value="USER">Users</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1">
              {selected === "PRINTER" ? (
                <Select
                  value={printer_name}
                  onValueChange={(value) => {
                    setPrinterName(value);
                    setOffset(0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Printer name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_PRINTERS}>All printers</SelectItem>
                    {(printers ?? []).map((printer) => (
                      <SelectItem key={printer.id} value={printer.name} className="capitalize">
                        {printer.name.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <UserSearch
                  placeholder="Search user"
                  selected={user}
                  onSelect={(value) => {
                    setUser(value);
                    setOffset(0);
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex p-6 mb-6">
        <Card className="relative w-full overflow-hidden p-6">
          <img
            src="/homepage/hs-inside.webp"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 select-none"
          />
          <div className="relative flex flex-col gap-4">
            <CardHeader className="px-0 -mb-4">
              <CardTitle className="text-2xl capitalize">{title}</CardTitle>
            </CardHeader>

            {awaiting_user ? (
              <div className="p-6 text-center text-muted-foreground">Search for a user to see their prints</div>
            ) : isPending ? (
              <div className="flex justify-center p-6">
                <Hammer />
              </div>
            ) : error ? (
              <div className="p-6">Failed to load history: {error.message}</div>
            ) : rows.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No prints found</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px] table-fixed [&_td]:text-center [&_th]:text-center">
                    <TableHeader>
                      <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        {all_printers && <TableHead>Printer</TableHead>}
                        <TableHead>Mass</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Queue</TableHead>
                        <TableHead>Success</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Reason</TableHead>
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
                          {all_printers && (
                            <TableCell className="capitalize">{row.printer?.name.toLowerCase() ?? "—"}</TableCell>
                          )}
                          <TableCell>{formatMass(row.print.mass)}</TableCell>
                          <TableCell>{formatRemaining(row.print.duration.total({ unit: "seconds" }))}</TableCell>
                          <TableCell>{row.queue}</TableCell>
                          <TableCell>
                            <PrintStatusBadge state={row.status.state} />
                          </TableCell>
                          <TableCell>{row.attempts}</TableCell>
                          <TableCell title={row.status.note}>
                            <div className="truncate text-muted-foreground">
                              {formatFailureReason(row.status.reason)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <TableButtons offset={offset} count={rows.length} onOffsetChange={setOffset} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
