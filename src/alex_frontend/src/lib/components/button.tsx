import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-base font-medium font-roboto-condensed ring-offset-background transition-all duration-100 ease-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border border-black text-black hover:text-white bg-white hover:bg-black dark:border-white dark:text-white dark:hover:text-black dark:bg-black dark:hover:bg-white",
        inverted: "border border-black text-white hover:text-black bg-black hover:bg-white dark:border-white dark:text-black dark:hover:text-white dark:bg-white dark:hover:bg-black",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        constructive: "bg-constructive text-constructive-foreground hover:bg-constructive/90",
        info: "bg-info text-info-foreground hover:bg-info/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "bg-primary text-primary-foreground hover:bg-primary/90",
        muted: "text-muted-foreground hover:text-black dark:text-white dark:hover:text-white/80",
      },
      scale: {
        sm: "h-8 px-2 text-sm",
        default: "h-10 px-4",
        md: "h-12 px-6 text-md",
        lg: "h-14 px-8 text-lg",
        icon: "p-1",
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
      variant: "primary",
      scale: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, scale, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, scale, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
