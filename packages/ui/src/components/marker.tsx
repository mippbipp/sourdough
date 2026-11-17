import { cn } from "@sourdough/ui/lib/utils";
import {
  mergeProps,
  renderElement,
  type PartProps,
} from "@ui-sdk/react/primitive";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-xs text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  {
    variants: {
      variant: {
        border: "border-b border-border pb-2",
        default: "",
        separator:
          "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
      },
    },
  }
);

function Marker({
  className,
  render,
  variant = "default",
  ...props
}: Omit<PartProps<"div">, "className"> &
  VariantProps<typeof markerVariants> & { className?: string }) {
  const own = {
    className: cn(markerVariants({ className, variant })),
    "data-slot": "marker",
    "data-variant": variant,
  };

  return renderElement("div", mergeProps(own, props), render);
}

function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-slot="marker-icon"
      {...props}
    />
  );
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      data-slot="marker-content"
      {...props}
    />
  );
}

export { Marker, MarkerIcon, MarkerContent, markerVariants };
