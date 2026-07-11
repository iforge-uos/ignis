import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Button } from "@packages/ui/components/button";
import {
  BarChart3Icon,
  ChevronRightIcon,
  ListTodoIcon,
  LockIcon,
  SlidersHorizontalIcon,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/control")({
  component: RouteComponent,
});

type SectionLink = { label: string; to: string };
type Section = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  links: SectionLink[];
};

const SECTIONS: Section[] = [
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
  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          <SlidersHorizontalIcon className="size-8" />
          3DP print control hub.
        </h2>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-3">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${section.accent}`}>
                <section.icon className="size-5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {section.links.map((link) => (
                <Button key={link.to} asChild variant="outline" className="justify-between">
                  <Link to={link.to}>
                    {link.label}
                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
