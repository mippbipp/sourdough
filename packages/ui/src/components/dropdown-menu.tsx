"use client";

import { cn } from "@sourdough/ui/lib/utils";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import type * as React from "react";

type WithClassName<P> = Omit<P, "className"> & { className?: string };

function DropdownMenu(props: React.ComponentProps<typeof Menu>) {
  return <Menu {...props} />;
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof MenuTrigger>) {
  return <MenuTrigger {...props} />;
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuContent>>) {
  return (
    <MenuContent
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-none bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuGroup(props: React.ComponentProps<typeof MenuGroup>) {
  return <MenuGroup {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuGroupLabel>> & {
  inset?: boolean;
}) {
  return (
    <MenuGroupLabel
      data-inset={inset}
      className={cn(
        "px-2 py-2 text-xs text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: WithClassName<React.ComponentProps<typeof MenuItem>> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuItem
      data-inset={inset}
      destructive={variant === "destructive"}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none data-destructive:text-destructive data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-destructive:data-highlighted:**:text-accent-foreground data-destructive:data-highlighted:bg-destructive/10 data-destructive:data-highlighted:text-destructive data-inset:pl-7 *:data-[slot=menu-shortcut]:ml-auto *:data-[slot=menu-shortcut]:tracking-widest *:data-[slot=menu-shortcut]:text-muted-foreground dark:data-destructive:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-destructive:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub(props: React.ComponentProps<typeof MenuSub>) {
  return <MenuSub {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuSubTrigger>> & {
  inset?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <MenuSubTrigger
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <MenuItemIcon mirror className="ml-auto">
        <ChevronRightIcon />
      </MenuItemIcon>
    </MenuSubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  sideOffset = 0,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuSubContent>>) {
  return (
    <MenuSubContent
      sideOffset={sideOffset}
      className={cn(
        "cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-auto min-w-[96px] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-none bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  inset,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuCheckboxItem>> & {
  inset?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <MenuCheckboxItem
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MenuItemIndicator className="pointer-events-none absolute right-2 flex items-center justify-center">
        <CheckIcon aria-hidden="true" />
      </MenuItemIndicator>
      {children}
    </MenuCheckboxItem>
  );
}

function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof MenuRadioGroup>
) {
  return <MenuRadioGroup {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuRadioItem>> & {
  inset?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <MenuRadioItem
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-xs outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MenuItemIndicator className="pointer-events-none absolute right-2 flex items-center justify-center">
        <CheckIcon aria-hidden="true" />
      </MenuItemIndicator>
      {children}
    </MenuRadioItem>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuSeparator>>) {
  return (
    <MenuSeparator
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuShortcut>>) {
  return (
    <MenuShortcut
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
