import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";
import { orpc } from "@/lib/orpc";
import { type MaterialFilter, PrintQueue, type QueueTabOption } from "@/components/printing/queue";
import { ListTodoIcon } from "lucide-react";

const QUEUE_TABS: QueueTabOption[] = [
  { value: "QUEUED", label: "Queued" },
  { value: "REVIEW", label: "Under Review" },
];

const zodTabs = z.enum(["QUEUED", "REVIEW"]);
type QueueTab = z.infer<typeof zodTabs>;

const TAB_STRING: Record<QueueTab, string> = {
  QUEUED: "prints in the queue",
  REVIEW: "prints under review",
};

export const Route = createFileRoute("/_authenticated/_3dponly/printing/queue/list")({
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

  const input =
    active_tab === "REVIEW"
      ? { by: "review" as const, offset }
      : material === "ALL"
        ? { by: "all" as const, offset }
        : { by: "queue" as const, value: material, offset };

  const { data, isPending, error } = useQuery(orpc.print.queue.get.queryOptions({ input }));

  return (
    <PrintQueue
      title="The iForge print queue."
      icon={<ListTodoIcon className="size-8" />}
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
      materialDisabled={active_tab === "REVIEW"}
      showLeadPosition
      emptyMessage={`No ${TAB_STRING[active_tab]}`}
      data={data}
      isPending={isPending}
      error={error}
      offset={offset}
      onOffsetChange={setOffset}
    />
  );
}
