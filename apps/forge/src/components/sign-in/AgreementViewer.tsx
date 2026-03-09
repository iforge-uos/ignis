import { Separator } from "@packages/ui/components/separator";
import { format } from "date-fns";
import type { ReactNode } from "react";
import Markdown from "react-markdown";
import { IForgeLogo } from "@/icons/IForge";
import { cn } from "@/lib/utils";

type AgreementViewModel = {
  name: string;
  content: string;
  version?: number;
  updated_at?: { epochMilliseconds: number };
};

interface AgreementViewerProps {
  agreement: AgreementViewModel;
  showLogo?: boolean;
  className?: string;
  footer?: ReactNode;
}

export function AgreementViewer({ agreement, showLogo = true, className, footer }: AgreementViewerProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {showLogo ? (
        <div className="flex justify-center">
          <IForgeLogo className="w-72" />
        </div>
      ) : null}

      <Separator className="mt-5 mb-5" />

      <div className="flex justify-center">
        <article className="prose lg:prose-xl dark:prose-invert leading-none prose-p:my-1 prose-li:my-2 prose-ul:my-2">
          <Markdown>{agreement.content}</Markdown>
        </article>
      </div>

      <Separator className="mt-5 mb-5" />

      {agreement.updated_at ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last Updated: {format(agreement.updated_at.epochMilliseconds, "PPP")}
        </p>
      ) : null}

      {agreement.version !== undefined ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Version: {agreement.version}</p>
      ) : null}

      {footer}
    </div>
  );
}
