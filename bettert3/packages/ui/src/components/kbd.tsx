// Based on https://dylanatsmith.com/wrote/styling-the-kbd-element
import { cn } from "@packages/ui/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";

const kdbVariants = cva(
  `inline-flex items-center justify-center border font-sans cursor-default relative select-none
  bg-background dark:bg-gray-600
   text-foreground dark:text-muted-foreground
  border-border dark:border-border
  shadow-[0_2px_0_1px] shadow-muted dark:shadow-muted/50
  hover:shadow-[0_1px_0_0.5px] hover:shadow-muted dark:hover:shadow-muted/50 hover:top-[1px]
  -top-[1px] min-w-[0.75rem] text-center`,
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        small: "rounded-sm px-1 text-xs",
        default: "rounded-md px-1.5 text-sm",
      },
    },
  },
);

export const Kbd = ({
  children,
  className,
  size,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
  VariantProps<typeof kdbVariants>) => (
  <div className={cn(kdbVariants({ className, size }))} {...props}>
    <kbd>{children}</kbd>
  </div>
);

export const Shortcut = ({
  keys,
  className,
  size,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
  VariantProps<typeof kdbVariants> & { keys: string[] }) => {
  return (
    <div className={className} {...props}>
      {keys.map((key, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <React.Fragment key={index}>
          {index > 0 && <span className="mx-0.5"> + </span>}
          <Kbd size={size}>{key}</Kbd>
        </React.Fragment>
      ))}
    </div>
  );
};
