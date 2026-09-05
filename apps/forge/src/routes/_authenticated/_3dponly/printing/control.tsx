import { createFileRoute } from "@tanstack/react-router";
import { BarChart3Icon, ListTodoIcon, LockIcon, SlidersHorizontalIcon } from "lucide-react";
import { HubPage, type HubSection } from "@/components/printing/hubs";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/control")({
  component: RouteComponent,
});

const SECTIONS: HubSection[] = [
  {
    title: "Printer Control",
    description: "Send jobs and control the live state of each printer.",
    icon: SlidersHorizontalIcon,
    accent: "bg-blue-500/10 text-blue-600",
    links: [
      { label: "Printer control", to: "/printing/queue/send" },
      { label: "Printer overview", to: "/printing/printers" },
    ],
  },
  {
    title: "Admin",
    description: "Restricted area for the 3DP team.",
    icon: LockIcon,
    accent: "bg-red-500/10 text-red-600",
    links: [{ label: "Admin dashboard", to: "/printing/admin" }],
  },
  {
    title: "Queues & History",
    description: "Browse the queue and past prints. Histories open per printer or user.",
    icon: ListTodoIcon,
    accent: "bg-violet-500/10 text-violet-600",
    links: [
      { label: "Print Queues", to: "/printing/queue/list" },
      { label: "Printer & User histories", to: "/printing/history" },
    ],
  },
  {
    title: "Stats",
    description: "Usage and throughput across printers and reps.",
    icon: BarChart3Icon,
    accent: "bg-emerald-500/10 text-emerald-600",
    links: [
      { label: "Printer stats", to: "/printing/stats/printer" },
      { label: "Rep stats", to: "/printing/stats/reps" },
    ],
  },
];

function RouteComponent() {
  return <HubPage title="3DP print control hub." icon={SlidersHorizontalIcon} sections={SECTIONS} />;
}
