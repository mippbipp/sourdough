"use client";

import { cn } from "@sourdough/ui/lib/utils";
import {
  Tooltip as TooltipPrimitive,
  TooltipArrow,
  TooltipContent as TooltipContentPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@ui-sdk/react/tooltip";
import type * as React from "react";

function Tooltip({
  delay = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive>) {
  return <TooltipPrimitive delay={delay} {...props} />;
}

function TooltipTrigger(
  props: React.ComponentProps<typeof TooltipTriggerPrimitive>
) {
  return <TooltipTriggerPrimitive {...props} />;
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof TooltipContentPrimitive>,
  "className" | "children"
> & { className?: string; children?: React.ReactNode }) {
  return (
    <TooltipContentPrimitive
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      className={cn(
        "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 overflow-visible rounded-none bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-instant:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    >
      {children}
      <TooltipArrow className="size-2.5 rotate-45 rounded-none bg-foreground data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1" />
    </TooltipContentPrimitive>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
