import { cn } from "@packages/ui/lib/utils";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";

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
  children?: React.ReactNode;
}

export const Timeline = ({ children, className, positions, ...props }: TimelineProps) => {
  return (
    <ul className={cn(timelineVariants({ positions }), className)} {...props}>
      {children}
    </ul>
  );
};

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
  children?: React.ReactNode;
}

export const TimelineItem = (
  { className, status, children, ...props }: TimelineItemProps,
) => (
  <li className={cn(timelineItemVariants({ status }), className)} {...props}>
    {children}
  </li>
);

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
}

export const TimelineDot = (
  { className, status, customIcon, ...props }: TimelineDotProps,
) => (
  <output className={cn("timeline-dot", timelineDotVariants({ status }), className)} {...props}>
    <div className="radix-circle size-2.5 rounded-full" />
    <CheckIcon className="radix-check size-3" />
    <Cross1Icon className="radix-cross size-2.5" />
    {customIcon}
  </output>
);

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

interface TimelineContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineContentVariants> {
  children?: React.ReactNode;
}

export const TimelineContent = (
  { className, side, children, ...props }: TimelineContentProps,
) => (
  <div className={cn(timelineContentVariants({ side }), className)}{...props}>
    {children}
  </div>
);

const timelineHeadingVariants = cva("row-start-1 row-end-1 line-clamp-1 max-w-full truncate", {
  variants: {
    side: {
      right: "col-start-3 col-end-4 mr-auto text-left",
      left: "col-start-1 col-end-2 ml-auto text-right",
    },
    variant: {
      primary: "font-medium text-base text-primary",
      secondary: "font-light text-muted-foreground text-sm",
    },
  },
  defaultVariants: {
    side: "right",
    variant: "primary",
  },
});

interface TimelineHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof timelineHeadingVariants> {
  children?: React.ReactNode;
}

export const TimelineHeading = ({ className, side, variant, children, ...props }: TimelineHeadingProps) => {
  const HeadingTag = variant === "primary" ? "h2" : "h3";
  return (
    <HeadingTag className={cn(timelineHeadingVariants({ side, variant }), className)} {...props}>
      {children}
    </HeadingTag>
  );
};

interface TimelineLineProps extends React.HTMLAttributes<HTMLHRElement> {
  done?: boolean;
}

export const TimelineLine = ({ className, done = false, ...props }: TimelineLineProps) => {
  return (
    <hr
      aria-orientation="vertical"
      className={cn(
        "col-start-2 col-end-3 row-start-2 row-end-2 mx-auto flex h-full min-h-16 w-0.5 justify-center rounded-full",
        done ? "bg-primary" : "bg-muted",
        className,
      )}
      {...props}
    />
  );
};

