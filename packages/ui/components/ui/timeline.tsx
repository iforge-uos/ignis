import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { Check, Circle, X } from "lucide-react";

import { cn } from "@ui/lib/utils";

const timelineVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-col items-stretch",
      horizontal: "flex-row items-center",
    },
    positions: {
      left: "[&>li]:grid-cols-[0_min-content_1fr]",
      right: "[&>li]:grid-cols-[1fr_min-content]",
      center: "[&>li]:grid-cols-[1fr_min-content_1fr]",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    positions: "left",
  },
});

interface TimelineProps extends React.HTMLAttributes<HTMLUListElement>, VariantProps<typeof timelineVariants> {
  orientation?: "vertical" | "horizontal";
}

const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ children, className, orientation = "vertical", positions, ...props }, ref) => {
    return (
      <ul className={cn(timelineVariants({ orientation, positions }), className)} ref={ref} {...props}>
        {children}
      </ul>
    );
  },
);
Timeline.displayName = "Timeline";

const timelineItemVariants = cva("", {
  variants: {
    orientation: {
      vertical: "grid items-center gap-x-2",
      horizontal: "flex items-center gap-x-4",
    },
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
  orientation?: "vertical" | "horizontal";
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, status, orientation = "vertical", children, ...props }, ref) => (
    <li className={cn(timelineItemVariants({ status, orientation }), className)} ref={ref} {...props}>
      {orientation === "vertical" && children}
      {orientation === "horizontal" && (
        <>
          <div className="flex flex-col items-center">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === TimelineHeading) {
                return React.cloneElement(child);
              }
              return null;
            })}
            <TimelineDot orientation={orientation} status={status} />
          </div>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === TimelineLine) {
              return React.cloneElement(child);
            }
            return null;
          })}
        </>
      )}
    </li>
  ),
);

TimelineItem.displayName = "TimelineItem";

const timelineDotVariants = cva("flex size-4 rounded-full border border-current", {
  variants: {
    orientation: {
      vertical: "col-start-2 col-end-3 row-start-1 row-end-1 items-center justify-center",
      horizontal: "mb-4",
    },
    status: {
      default: "[&>svg]:hidden",
      current: "[&>.lucide-circle]:fill-current [&>.lucide-circle]:text-current [&>svg:not(.lucide-circle)]:hidden",
      done: "bg-primary [&>.lucide-check]:text-background [&>svg:not(.lucide-check)]:hidden",
      error: "border-destructive bg-destructive [&>.lucide-x]:text-background [&>svg:not(.lucide-x)]:hidden",
    },
  },
  defaultVariants: {
    status: "default",
  },
});

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof timelineDotVariants> {
  customIcon?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, orientation = "vertical", status, customIcon, ...props }, ref) => (
    <div
      role="status"
      className={cn("timeline-dot", timelineDotVariants({ orientation, status }), className)}
      ref={ref}
      {...props}
    >
      <Circle className="size-2.5" />
      <Check className="size-3" />
      <X className="size-3" />
      {customIcon}
    </div>
  ),
);
TimelineDot.displayName = "TimelineDot";

const timelineContentVariants = cva("text-muted-foreground", {
  variants: {
    orientation: {
      vertical: "row-start-2 row-end-2 pb-8",
      horizontal: "text-center mt-2",
    },
    side: {
      right: "col-start-3 col-end-4 mr-auto text-left",
      left: "col-start-1 col-end-2 ml-auto text-right",
    },
  },
  defaultVariants: {
    side: "right",
  },
});

interface TimelineContent
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof timelineContentVariants> {
  orientation?: "vertical" | "horizontal";
}

const TimelineContent = React.forwardRef<HTMLParagraphElement, TimelineContent>(
  ({ className, orientation = "vertical", side, ...props }, ref) => (
    <p className={cn(timelineContentVariants({ orientation, side }), className)} ref={ref} {...props} />
  ),
);
TimelineContent.displayName = "TimelineContent";

const timelineHeadingVariants = cva("line-clamp-1", {
  variants: {
    orientation: {
      vertical: "row-start-1 row-end-1 max-w-full truncate",
      horizontal: "text-center mb-2",
    },
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

interface TimelineHeading
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof timelineHeadingVariants> {
  orientation?: "vertical" | "horizontal";
}

const TimelineHeading = React.forwardRef<HTMLParagraphElement, TimelineHeading>(
  ({ className, orientation = "vertical", side, variant, ...props }, ref) => (
    <p
      role="heading"
      aria-level={variant === "primary" ? 2 : 3}
      className={cn(timelineHeadingVariants({ orientation, side, variant }), className)}
      ref={ref}
      {...props}
    />
  ),
);
TimelineHeading.displayName = "TimelineHeading";

interface TimelineLineProps extends React.HTMLAttributes<HTMLHRElement> {
  done?: boolean;
  orientation?: "vertical" | "horizontal";
}

const TimelineLine = React.forwardRef<HTMLHRElement, TimelineLineProps>(
  ({ className, orientation = "vertical", done = false, ...props }, ref) => {
    return (
      <hr
        // biome-ignore lint/a11y/useAriaPropsForRole: <explanation>
        role="separator"
        aria-orientation={orientation === "vertical" ? "vertical" : "horizontal"}
        className={cn(
          orientation === "vertical"
            ? "col-start-2 col-end-3 row-start-2 row-end-3 mx-auto flex h-full min-h-16 w-0.5 justify-center"
            : "mx-4 flex h-0.5 w-full min-w-16",
          "rounded-full",
          done ? "bg-primary" : "bg-muted",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
TimelineLine.displayName = "TimelineLine";

export { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineHeading, TimelineLine };
