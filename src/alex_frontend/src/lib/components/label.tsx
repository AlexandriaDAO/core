import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "inline-flex gap-2 items-center justify-start font-roboto-condensed font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-primary",
        destructive: "text-destructive",
        constructive: "text-constructive",
        info: "text-info"
      },
      scale: {
        sm: "text-sm",
        default: "text-base",
        md: "text-md",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      scale: "lg",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, scale, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, scale, className }))}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
