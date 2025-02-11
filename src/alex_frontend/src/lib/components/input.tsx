import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  // ending space is important
  "p-1 font-roboto-condensed font-medium "+
  "flex w-full border bg-white text-black dark:bg-gray-800 dark:text-foreground " +
  "file:border-0 file:bg-transparent file:font-medium " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 " +
  "disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "border-gray-400",
          "focus-visible:ring-gray-700",
          // "focus-visible:ring-offset-background",
          "placeholder:text-muted-foreground",
        ],
        destructive: [
          "border-destructive",
          "focus-visible:ring-destructive",
          "focus-visible:ring-offset-background",
          "placeholder:text-destructive/60",
        ],
        constructive: [
          "border-constructive",
          "focus-visible:ring-constructive",
          "focus-visible:ring-offset-constructive/20",
          "placeholder:text-constructive/60",
        ],
      },
      scale: {
        sm: [
          "text-sm",
          "file:text-sm",
          "placeholder:text-sm",
        ],
        default: [
          "text-base",
          "file:text-base",
          "placeholder:text-base",
        ],
        md: [
          "text-md",
          "file:text-md",
          "placeholder:text-md",
        ],
        lg: [
          "text-lg",
          "file:text-lg",
          "placeholder:text-lg",
        ],
      },
      rounded: {
        none: "rounded-none",
        default: "rounded",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      scale: "lg",
      rounded: 'default'
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, scale, rounded, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, scale, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
