import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs [a&]:hover:bg-primary/90",
        neutral:
          "border-border bg-secondary text-secondary-foreground shadow-xs [a&]:hover:bg-secondary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border border-destructive/30 [a&]:hover:bg-destructive/25",
        danger:
          "border-transparent bg-destructive/15 text-destructive border border-destructive/30 [a&]:hover:bg-destructive/25",
        success:
          "border-transparent bg-success/15 text-success border border-success/30 [a&]:hover:bg-success/25",
        warning:
          "border-transparent bg-warning/15 text-warning border border-warning/30 [a&]:hover:bg-warning/25",
        info:
          "border-transparent bg-info/15 text-info border border-info/30 [a&]:hover:bg-info/25",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
