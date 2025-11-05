"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { type LucideIcon, XIcon } from "lucide-react";
import { type ComponentProps, createContext, type HTMLAttributes, type MouseEventHandler, useContext } from "react";
import { Button } from "@packages/ui/components/button";
import { cn } from "@packages/ui/lib/utils";
import React from "react";
import { cva, VariantProps } from "class-variance-authority";

const bannerVariants = cva(
  "flex w-full items-center justify-between gap-2 bg-primary px-4 py-2 text-primary-foreground",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-foreground/40 border border-destructive-foreground/10",
        success:
          "bg-success text-success-foreground hover:bg-success-foreground/40 border border-success-foreground/10",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning-foreground/40 border border-warning-foreground/10",
        info: "bg-info text-info-foreground hover:bg-info-foreground/40 border border-info-foreground/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BannerContextProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  variant?: VariantProps<typeof bannerVariants>["variant"];
};

export const BannerContext = createContext<BannerContextProps>({
  show: true,
  setShow: () => {},
  variant: "default",
});

export type BannerProps = HTMLAttributes<HTMLDivElement> & {
  visible?: boolean;
  defaultVisible?: boolean;
  onClose?: () => void;
  inset?: boolean;
} & VariantProps<typeof bannerVariants>;

export const Banner = ({
  children,
  visible,
  defaultVisible = true,
  onClose,
  className,
  inset = false,
  variant,
  ...props
}: BannerProps) => {
  const [show, setShow] = useControllableState({
    defaultProp: defaultVisible,
    prop: visible,
    onChange: onClose,
  });

  if (!show) {
    return null;
  }

  return (
    <BannerContext.Provider value={{ show, setShow, variant }}>
      <div className={cn(bannerVariants({ variant, className }), inset && "rounded-lg", className)} {...props}>
        {children}
      </div>
    </BannerContext.Provider>
  );
};

export type BannerIconProps = HTMLAttributes<HTMLDivElement> & {
  icon: LucideIcon;
};

export const BannerIcon = ({ icon: Icon, className, ...props }: BannerIconProps) => (
  <div className={cn("rounded-full border border-background/20 bg-background/10 p-1 shadow-sm", className)} {...props}>
    <Icon size={16} />
  </div>
);

export type BannerTitleProps = HTMLAttributes<HTMLParagraphElement>;

export const BannerTitle = ({ className, ...props }: BannerTitleProps) => (
  <p className={cn("flex-1 text-sm", className)} {...props} />
);

export type BannerActionProps = ComponentProps<typeof Button>;

export const BannerAction = ({ variant = "outline", size = "sm", className, ...props }: BannerActionProps) => (
  <Button
    className={cn("shrink-0 bg-transparent hover:bg-background/10 hover:text-background", className)}
    size={size}
    variant={variant}
    {...props}
  />
);

export type BannerCloseProps = ComponentProps<typeof Button>;

export const BannerClose = ({ variant = "ghost", size = "icon", onClick, className, ...props }: BannerCloseProps) => {
  const { setShow } = useContext(BannerContext);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setShow(false);
    onClick?.(e);
  };

  return (
    <Button
      className={cn("shrink-0 bg-transparent hover:bg-background/10 hover:text-background", className)}
      onClick={handleClick}
      size={size}
      variant={variant}
      {...props}
    >
      <XIcon size={18} />
    </Button>
  );
};
