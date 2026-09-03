import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-10 w-full min-w-0 rounded-md border bg-background/50 px-3 py-2 text-sm shadow-xs transition-all duration-150 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/40 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
        error:
          "border-destructive focus-visible:ring-destructive/30 focus-visible:ring-[3px] text-destructive focus-visible:border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Input({
  className,
  variant = "default",
  error = false,
  type,
  ...props
}) {
  const activeVariant = error ? "error" : variant;

  return (
    <input
      type={type}
      data-slot="input"
      aria-invalid={error || activeVariant === "error"}
      className={cn(inputVariants({ variant: activeVariant }), className)}
      {...props} />
  );
}

export { Input, inputVariants }
