"use client";

import React from "react";

import { cn } from "@udecode/cn";
import { type UseVirtualFloatingOptions, flip, offset } from "@udecode/plate-floating";
import {
  FloatingLinkUrlInput,
  type LinkFloatingToolbarState,
  LinkOpenButton,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from "@udecode/plate-link";

import { buttonVariants } from "./button";
import { inputVariants } from "./input";
import { popoverVariants } from "./popover";
import { Separator } from "./separator";
import { ExternalLink, Link, Text, Unlink } from "lucide-react";

const floatingOptions: UseVirtualFloatingOptions = {
  middleware: [
    offset(12),
    flip({
      fallbackPlacements: ["bottom-end", "top-start", "top-end"],
      padding: 12,
    }),
  ],
  placement: "bottom-start",
};

export interface LinkFloatingToolbarProps {
  state?: LinkFloatingToolbarState;
}

export function LinkFloatingToolbar({ state }: LinkFloatingToolbarProps) {
  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const { hidden, props: insertProps, ref: insertRef, textInputProps } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const { editButtonProps, props: editProps, ref: editRef, unlinkButtonProps } = useFloatingLinkEdit(editState);

  if (hidden) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Link className="size-4" />
        </div>

        <FloatingLinkUrlInput className={inputVariants({ h: "sm", variant: "ghost" })} placeholder="Paste link" />
      </div>

      <Separator />

      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Text className="size-4" />
        </div>
        <input
          className={inputVariants({ h: "sm", variant: "ghost" })}
          placeholder="Text to display"
          {...textInputProps}
        />
      </div>
    </div>
  );

  const editContent = editState.isEditing ? (
    input
  ) : (
    <div className="box-content flex h-9 items-center gap-1">
      <button className={buttonVariants({ size: "sm", variant: "ghost" })} type="button" {...editButtonProps}>
        Edit link
      </button>

      <Separator orientation="vertical" />

      <LinkOpenButton
        className={buttonVariants({
          size: "sms",
          variant: "ghost",
        })}
      >
        <ExternalLink width={18} />
      </LinkOpenButton>

      <Separator orientation="vertical" />

      <button
        className={buttonVariants({
          size: "sms",
          variant: "ghost",
        })}
        type="button"
        {...unlinkButtonProps}
      >
        <Unlink width={18} />
      </button>
    </div>
  );

  return (
    <>
      <div className={cn(popoverVariants(), "w-auto p-1")} ref={insertRef} {...insertProps}>
        {input}
      </div>

      <div className={cn(popoverVariants(), "w-auto p-1")} ref={editRef} {...editProps}>
        {editContent}
      </div>
    </>
  );
}
