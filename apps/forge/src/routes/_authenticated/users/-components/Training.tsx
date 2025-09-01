import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { Switch } from "@packages/ui/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Fuse from "fuse.js";
import { ArrowDown, Award, CheckCircle, ChevronDown, Clock, ExternalLink, Info, MapPin, Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { LocationIcon } from "@/icons/Locations";
import { cn, toTitleCase } from "@/lib/utils";
import {
  getTrainingStatus,
  TrainingWithRep,
  type TrainingStatus,
 } from "@/lib/utils/training";
import { Procedures } from "@/types/router";

type Training = Procedures["users"]["profile"]["get"]["training"][number];

interface TrainingTableProps {
  training: Training[];
  isRep: boolean;
}

/**
 * Renders a training status badge with tooltip and optional link
 */
function TrainingStatusBadge({ status }: { status: TrainingStatus }) {
  const badgeContent = (
    <Badge className={status.className} variant={status.variant}>
      {status.linkParams ? (
        <span className="flex items-center gap-1">
          {status.label}
          <ExternalLink className="w-3 h-3" />
        </span>
      ) : (
        status.label
      )}
    </Badge>
  );

  const wrappedBadge = status.linkParams ? (
    <Link to="/training/$id" params={status.linkParams} className="inline-block">
      {badgeContent}
    </Link>
  ) : (
    badgeContent
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{wrappedBadge}</TooltipTrigger>
      <TooltipContent>
       {status.nextStep ? <p>Next, {status.nextStep}</p> : "Nothing else to do"}
      </TooltipContent>
    </Tooltip>
  );
}

export default function TrainingTable({ training, isRep }: TrainingTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ desc: false, id: "name" }]);
  const [collapseEntries, setCollapseEntries] = useState(isRep);

  const fuse = useMemo(
    () =>
      new Fuse(training, {
        keys: ["name", "description"],
        threshold: 0.3,
        distance: 100,
        minMatchCharLength: 2,
      }),
    [training],
  );

  const filteredTrainings = useMemo(
    () => (searchTerm ? fuse.search(searchTerm).map((result) => result.item) : training),
    [training, searchTerm, fuse],
  );

  const collapsedTrainings = useMemo(
    () =>
      collapseEntries
        ? filteredTrainings.reduce((acc, training) => {
            if (training.rep !== null) {
              // only include user training
              const repId = training.rep.id;
              acc.push({
                ...training,
                rep: filteredTrainings.find((existing) => existing.id === repId)!,
              });
            }

            return acc;
          }, [] as TrainingWithRep[])
        : filteredTrainings as TrainingWithRep[],
    [filteredTrainings, collapseEntries],
  );

  const columns: ColumnDef<TrainingWithRep>[] = useMemo(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <Button
              className="size-7 shadow-none text-muted-foreground"
              onClick={row.getToggleExpandedHandler()}
              aria-expanded={row.getIsExpanded()}
              aria-label={
                row.getIsExpanded()
                  ? `Collapse details for ${row.original.name}`
                  : `Expand details for ${row.original.name}`
              }
              size="icon"
              variant="ghost"
            >
              <ChevronDown
                className={cn(`opacity-60 transition-transform duration-300`, row.getIsExpanded() ? "rotate-180" : "")}
                size={16}
                aria-hidden="true"
              />
            </Button>
          ) : null;
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex my-auto items-center h-auto p-0 font-semibold hover:cursor-pointer link-underline"
          >
            Name
            <ArrowDown
              className={cn(
                "ml-2 size-4 transition-transform duration-300",
                column.getIsSorted() === "asc" ? "" : "rotate-180",
              )}
            />
          </button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-sm text-muted-foreground line-clamp-2 text-ellipsis w-72">
              {row.original.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const training = row.original;
          const status = getTrainingStatus(training, isRep, collapseEntries);
          return <TrainingStatusBadge status={status} />;
        },
      },
      {
        accessorKey: "locations",
        header: "Locations",
        cell: ({ row }) => {
          const training = row.original;
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {training.locations
                  .sort((a, b) => a.localeCompare(b))
                  .map((location) => (
                    <Badge key={location} variant="outline" className="text-xs">
                      <LocationIcon className="size-3 mr-1" location={location} tooltip={false} />
                      {toTitleCase(location)}
                    </Badge>
                  ))}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => {
          const training = row.original;
          return (
            <div className="flex gap-1">
              {training.compulsory && (
                <Badge variant="destructive" className="text-xs">
                  Compulsory
                </Badge>
              )}
              {training.in_person && (
                <Badge variant="secondary" className="text-xs">
                  In-Person
                </Badge>
              )}
            </div>
          );
        },
      },
    ],
    [isRep, collapseEntries],
  );

  const table = useReactTable({
    data: collapsedTrainings,
    columns,
    getRowCanExpand: () => true, // All rows can expand to show more details
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    state: {
      globalFilter: searchTerm,
      sorting,
    },
  });

  return (
    <Card className="shadow-md">
      <CardHeader className="grid grid-cols-2 items-center">
        <CardTitle className="">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Training Records
          </div>
          {isRep && (
            <div className="flex items-center mt-2 gap-2">
              <Label htmlFor="collapse-toggle" className="text-sm font-medium">
                Collapse Entries
              </Label>
              <Switch id="collapse-toggle" checked={collapseEntries} onCheckedChange={setCollapseEntries} />
            </div>
          )}
        </CardTitle>
        <div className="relative px-2 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search training..."
            value={searchTerm ?? ""}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
                        <TableCell
                          key={cell.id}
                          className="whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={row.getVisibleCells().length}>
                          <div className="flex items-start gap-6 p-4 m-2">
                            <div className="flex-1 space-y-4">
                              {/* Description */}
                              <div>
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                  <Info className="w-5 h-5" />
                                  Training Description
                                </h4>
                                <p className="text-sm max-w- text-muted-foreground leading-relaxed pl-7 break-words overflow-wrap-anywhere">
                                  {row.original.description}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  {/* Progress & Completion Times */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                      <Clock className="w-5 h-5" />
                                      Progress & Completion
                                    </h4>
                                    <div className="space-y-2 pl-7">
                                      {row.original["@created_at"] ? (
                                        <div className="flex items-center gap-2 text-sm">
                                          <CheckCircle className="w-3 h-3 text-tick" />
                                          <span className="text-muted-foreground">Online completed:</span>
                                          <span className="font-medium">
                                            {row.original["@created_at"].toLocaleDateString()} at{" "}
                                            {row.original["@created_at"].toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Clock className="w-3 h-3 text-muted-foreground" />
                                          <span className="text-muted-foreground">Online: Not completed</span>
                                        </div>
                                      )}

                                      {row.original.in_person &&
                                        (row.original["@in_person_created_at"] ? (
                                          <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-3 h-3 text-tick" />
                                            <span className="text-muted-foreground">In-person completed:</span>
                                            <span className="font-medium">
                                              {row.original["@in_person_created_at"].toLocaleDateString()} at{" "}
                                              {row.original["@in_person_created_at"].toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">In-person: Not completed</span>
                                          </div>
                                        ))}

                                      {isRep && row.original.rep && (
                                        <>
                                          {row.original.rep["@created_at"] ? (
                                            <div className="flex items-center gap-2 text-sm">
                                              <CheckCircle className="w-3 h-3 text-tick" />
                                              <span className="text-muted-foreground">Rep online completed:</span>
                                              <span className="font-medium">
                                                {row.original.rep["@created_at"].toLocaleDateString()} at{" "}
                                                {row.original.rep["@created_at"].toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-2 text-sm">
                                              <Clock className="w-3 h-3 text-muted-foreground" />
                                              <span className="text-muted-foreground">Rep online: Not completed</span>
                                            </div>
                                          )}

                                          {row.original.rep.in_person && row.original.rep["@in_person_created_at"] ? (
                                            <div className="flex items-center gap-2 text-sm">
                                              <CheckCircle className="w-3 h-3 text-tick" />
                                              <span className="text-muted-foreground">Rep in-person completed:</span>
                                              <span className="font-medium">
                                                {row.original.rep["@in_person_created_at"].toLocaleDateString()} at{" "}
                                                {row.original.rep["@in_person_created_at"].toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </div>
                                          ) : row.original.rep.in_person ? (
                                            <div className="flex items-center gap-2 text-sm">
                                              <Clock className="w-3 h-3 text-muted-foreground" />
                                              <span className="text-muted-foreground">
                                                Rep in-person: Not completed
                                              </span>
                                            </div>
                                          ) : null}
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Requirements & Details */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5" />
                                      Requirements
                                    </h4>
                                    <div className="space-y-2 pl-7">
                                      <div className="flex items-center gap-2 text-sm">
                                        <div
                                          className={cn(
                                            "w-2 h-2 rounded-full",
                                            row.original.compulsory ? "bg-cross" : "bg-gray-300",
                                          )}
                                        />
                                        <span className="text-muted-foreground">Compulsory:</span>
                                        <span
                                          className={cn(
                                            "font-medium",
                                            row.original.compulsory ? "text-cross" : "text-muted-foreground",
                                          )}
                                        >
                                          {row.original.compulsory ? "Yes" : "No"}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-sm">
                                        <div
                                          className={cn(
                                            "w-2 h-2 rounded-full",
                                            row.original.in_person ? "bg-blue-500" : "bg-gray-300",
                                          )}
                                        />
                                        <span className="text-muted-foreground">In-person required:</span>
                                        <span
                                          className={cn(
                                            "font-medium",
                                            row.original.in_person ? "text-blue-600" : "text-muted-foreground",
                                          )}
                                        >
                                          {row.original.in_person ? "Yes" : "No"}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-sm">
                                        <div
                                          className={cn(
                                            "w-2 h-2 rounded-full",
                                            row.original.enabled ? "bg-tick" : "bg-cross",
                                          )}
                                        />
                                        <span className="text-muted-foreground">Status:</span>
                                        <span
                                          className={cn(
                                            "font-medium",
                                            row.original.enabled ? "text-tick" : "text-cross",
                                          )}
                                        >
                                          {row.original.enabled ? "Active" : "Disabled"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Available Locations */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                      <MapPin className="w-5 h-5" />
                                      Available Locations
                                    </h4>
                                    <div className="flex flex-wrap gap-2 pl-7">
                                      {row.original.locations
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((location) => (
                                          <div className="flex items-center gap-1" key={location}>
                                            <LocationIcon
                                              className="w-3 h-3 mr-1"
                                              location={location}
                                              tooltip={false}
                                            />
                                            {toTitleCase(location)}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>

                                {row.original.icon_url ? (
                                  <img
                                    src={`/machines/${row.original.icon_url}`}
                                    alt={`${row.original.name} icon`}
                                    className="h-84 rounded-xl object-contain"
                                  />
                                ) : (
                                  <div className="w-84 rounded-xl bg-muted flex items-center justify-center">
                                    <Award className="w-12 h-12 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
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
