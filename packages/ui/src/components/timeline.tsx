// https://github.com/shadcn-ui/ui/pull/3374
import { CheckIcon, CrossIcon } from "lucide-react";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";

import { cn } from "@packages/ui/lib/utils";

const timelineVariants = cva("grid", {
  variants: {
    positions: {
      left: "[&>li]:grid-cols-[0_min-content_1fr]",
      right: "[&>li]:grid-cols-[1fr_min-content]",
      center: "[&>li]:grid-cols-[1fr_min-content_1fr]",
    },
  },
  defaultVariants: {
    positions: "left",
  },
});

interface TimelineProps extends React.HTMLAttributes<HTMLUListElement>, VariantProps<typeof timelineVariants> {
  ref?: React.Ref<HTMLUListElement>;
}

function Timeline({ children, className, positions, ref, ...props }: TimelineProps) {
  return (
    <ul className={cn(timelineVariants({ positions }), className)} ref={ref} {...props}>
      {children}
    </ul>
  );
}

const timelineItemVariants = cva("grid items-center gap-x-2", {
  variants: {
    status: {
      done: "text-primary",
      default: "text-muted-foreground",
    },
  },
  defaultVariants: {
    status: "default",
  },
});

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement>, VariantProps<typeof timelineItemVariants> {
  ref?: React.Ref<HTMLLIElement>;
}

function TimelineItem({ className, status, ref, ...props }: TimelineItemProps) {
  return <li className={cn(timelineItemVariants({ status }), className)} ref={ref} {...props} />;
}

const timelineDotVariants = cva(
  "col-start-2 col-end-3 row-start-1 row-end-1 flex size-4 items-center justify-center rounded-full border border-current",
  {
    variants: {
      status: {
        default: "[&>*]:hidden",
        current: "[&>*:not(.radix-circle)]:hidden [&>.radix-circle]:bg-current [&>.radix-circle]:fill-current",
        done: "bg-primary [&>*:not(.radix-check)]:hidden [&>.radix-check]:text-background",
        error: "border-destructive bg-destructive [&>*:not(.radix-cross)]:hidden [&>.radix-cross]:text-background",
        custom: "[&>*:not(:nth-child(4))]:hidden [&>*:nth-child(4)]:block",
      },
    },
    defaultVariants: {
      status: "default",
    },
  },
);

interface TimelineDotProps extends React.HTMLAttributes<HTMLOutputElement>, VariantProps<typeof timelineDotVariants> {
  customIcon?: React.ReactNode;
  ref?: React.Ref<HTMLOutputElement>;
}

function TimelineDot({ className, status, customIcon, ref, ...props }: TimelineDotProps) {
  return (
    <output className={cn("timeline-dot", timelineDotVariants({ status }), className)} ref={ref} {...props}>
      <div className="radix-circle size-2.5 rounded-full" />
      <CheckIcon className="radix-check size-3" />
      <CrossIcon className="radix-cross size-2.5" />
      {customIcon}
    </output>
  );
}

const timelineContentVariants = cva("row-start-2 row-end-2 pb-8 text-muted-foreground", {
  variants: {
    side: {
      right: "col-start-3 col-end-4 mr-auto text-left",
      left: "col-start-1 col-end-2 ml-auto text-right",
    },
  },
  defaultVariants: {
    side: "right",
  },
});

interface TimelineConentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineContentVariants> {
  ref?: React.Ref<HTMLDivElement>;
}

function TimelineContent({ className, side, ref, ...props }: TimelineConentProps) {
  return <div className={cn(timelineContentVariants({ side }), className)} ref={ref} {...props} />;
}

const timelineHeadingVariants = cva("row-start-1 row-end-1 line-clamp-1 max-w-full truncate", {
  variants: {
    side: {
      right: "col-start-3 col-end-4 mr-auto text-left",
      left: "col-start-1 col-end-2 ml-auto text-right",
    },
    variant: {
      primary: "text-base font-medium text-primary",
      secondary: "text-sm font-light text-muted-foreground",
    },
  },
  defaultVariants: {
    side: "right",
    variant: "primary",
  },
});

interface TimelineHeadingProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof timelineHeadingVariants> {
  ref?: React.Ref<HTMLParagraphElement>;
}

function TimelineHeading({ className, side, variant, ref, ...props }: TimelineHeadingProps) {
  return (
    <p
      role="heading"
      aria-level={variant === "primary" ? 2 : 3}
      className={cn(timelineHeadingVariants({ side, variant }), className)}
      ref={ref}
      {...props}
    />
  );
}

interface TimelineLineProps extends React.HTMLAttributes<HTMLHRElement> {
  done?: boolean;
  ref?: React.Ref<HTMLHRElement>;
}

function TimelineLine({ className, done = false, ref, ...props }: TimelineLineProps) {
  return (
    <hr
      aria-orientation="vertical"
      className={cn(
        "col-start-2 col-end-3 row-start-2 row-end-2 mx-auto flex h-full min-h-16 w-0.5 justify-center rounded-full",
        done ? "bg-primary" : "bg-muted",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineHeading, TimelineLine };
