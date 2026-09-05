import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";
import { orpc } from "@/lib/orpc";
import { type MaterialFilter, PrintQueue, type QueueTabOption } from "@/components/printing/queue";
import { FileIcon } from "lucide-react";

const QUEUE_TABS: QueueTabOption[] = [
  { value: "QUEUED", label: "Queued" },
  { value: "REVIEW", label: "Under Review" },
  { value: "HISTORY", label: "Print History" },
];

const zodTabs = z.enum(["QUEUED", "REVIEW", "HISTORY"]);
type QueueTab = z.infer<typeof zodTabs>;

const TAB_STRING: Record<QueueTab, string> = {
  QUEUED: "prints queued",
  REVIEW: "prints under review",
  HISTORY: "finished prints",
};

export const Route = createFileRoute("/_authenticated/printing/user/queue")({
  component: RouteComponent,
  validateSearch: z.object({
    tab: zodTabs.default("QUEUED"),
  }),
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  const [active_tab, setActiveTab] = useState<QueueTab>(tab);
  const [offset, setOffset] = useState(0);
  const [material, setMaterial] = useState<MaterialFilter>("ALL");

  const { data, isPending, error } = useQuery(
    orpc.print.public.users.prints.queryOptions({
      input: { type: active_tab, offset, queue: material === "ALL" ? undefined : material },
    }),
  );

  return (
    <PrintQueue
      title="Your 3d prints at the University of Sheffield's iForge."
      icon={<FileIcon className="size-8" />}
      tabs={QUEUE_TABS}
      activeTab={active_tab}
      onTabChange={(value) => {
        setActiveTab(value as QueueTab);
        setOffset(0);
      }}
      material={material}
      onMaterialChange={(value) => {
        setMaterial(value);
        setOffset(0);
      }}
      showLeadPosition={active_tab !== "HISTORY"}
      emptyMessage={`You have no ${TAB_STRING[active_tab]}`}
      data={data}
      isPending={isPending}
      error={error}
      offset={offset}
      onOffsetChange={setOffset}
    />
  );
}
