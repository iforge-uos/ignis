import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Link } from "@tanstack/react-router";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

export type HubLink = { label: string; to: string };

export type HubSection = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  links: HubLink[];
};

export function HubPage({
  title,
  icon: Icon,
  sections,
}: {
  title: string;
  icon: LucideIcon;
  sections: HubSection[];
}) {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <h2 className="mx-14 mt-8 mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          <Icon className="size-8" />
          {title}
        </h2>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {sections.map((section) => (
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
