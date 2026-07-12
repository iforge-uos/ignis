import { Button } from "@packages/ui/components/button";
import { Card } from "@packages/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheckIcon, FileBoxIcon, FileCodeIcon, LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Hammer } from "@/components/loading";
import { formatRemaining, TableButtons } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/_3dpadminonly/review")({
  component: RouteComponent,
});

const STATUS_OPTIONS = [
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "QUEUED", label: "Queued" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

const STATE_VALUES: Record<string, StatusValue> = {
  UnderReview: "UNDER_REVIEW",
  Queued: "QUEUED",
  Cancelled: "CANCELLED",
};

function FileButton({ id, name, file_type }: { id: string; name: string; file_type: "gcode" | "3mf" }) {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/print/queue/${id}?file_type=${file_type}`);
      if (!response.ok) throw new Error(`Could not download ${name}.${file_type}`);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.${file_type}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not download ${name}.${file_type}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" disabled={downloading} onClick={download}>
      {downloading ? (
        <LoaderCircleIcon className="size-4 animate-spin" />
      ) : file_type === "gcode" ? (
        <FileCodeIcon className="size-4" />
      ) : (
        <FileBoxIcon className="size-4" />
      )}
      {file_type}
    </Button>
  );
}

function RouteComponent() {
  const [offset, setOffset] = useState(0);

  const { data, isPending, error, refetch } = useQuery(
    orpc.print.queue.get.queryOptions({ input: { by: "review", offset } }),
  );

  const update = useMutation(orpc.print.queue.status.mutationOptions({ onSuccess: () => refetch() }));

  const rows = data ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          <ClipboardCheckIcon className="size-8" />
          Prints that need reviewing.
        </h2>
      </div>
      <div className="p-6">
        <Card className="p-6">
          {isPending ? (
            <div className="flex justify-center p-6">
              <Hammer />
            </div>
          ) : error ? (
            <div className="p-6">Failed to load prints: {error.message}</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No prints under review</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <Table className="min-w-[720px] [&_td]:text-center [&_th]:text-center">
                  <TableHeader>
                    <TableRow className="[&>th]:h-12 [&>th]:text-base [&>th]:font-semibold">
                      <TableHead>Position</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Mass</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(({ id, print, status, position }) => (
                      <TableRow key={id}>
                        <TableCell className="text-muted-foreground">{position}</TableCell>
                        <TableCell className="font-medium">
                          <div className="truncate" title={print.name}>
                            {print.name}
                          </div>
                        </TableCell>
                        <TableCell>{print.author.display_name}</TableCell>
                        <TableCell>{print.mass}g</TableCell>
                        <TableCell>{formatRemaining(print.duration.total({ unit: "seconds" }))}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <FileButton id={print.id} name={print.name} file_type="3mf" />
                            <FileButton id={print.id} name={print.name} file_type="gcode" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={STATE_VALUES[status.state] ?? "UNDER_REVIEW"}
                            disabled={update.isPending}
                            onValueChange={(value) =>
                              update.mutate({ id: print.id, status: value as StatusValue })
                            }
                          >
                            <SelectTrigger className="mx-auto w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <TableButtons offset={offset} count={rows.length} onOffsetChange={setOffset} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
