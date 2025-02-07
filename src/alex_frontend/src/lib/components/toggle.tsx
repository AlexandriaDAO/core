"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        tag: "border border-input bg-transparent data-[state=off]:hover:bg-[#2A2620] data-[state=on]:bg-balancebox data-[state=on]:text-[#F6F930] data-[state=on]:hover:bg-[hsl(10,35%,20%)]",
        collection: "border border-input bg-transparent data-[state=off]:hover:bg-[#2A2620] data-[state=on]:bg-balancebox data-[state=on]:text-[#F6F930] data-[state=on]:hover:bg-[hsl(10,35%,20%)]",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

// Add this new type and component to the existing toggle.tsx file

// Add to existing types
type PrincipalToggleProps = {
  value: string;
  label?: string;
  isSelected?: boolean;
  onToggle: (value: string) => void;
  variant?: 'default' | 'user' | 'selected';
};

// Add this new component
export function PrincipalToggle({
  value,
  label,
  isSelected,
  onToggle,
  variant = 'default'
}: PrincipalToggleProps) {
  const baseStyles = "px-3 py-1 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50";
  
  const variantStyles = {
    default: `${isSelected ? 'bg-gray-400 text-gray-700' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300 focus:ring-gray-400`,
    user: `${isSelected ? 'bg-green-600 text-white' : 'bg-green-500 text-white'} hover:bg-green-600 focus:ring-green-500`,
    selected: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
  };

  return (
    <button
      onClick={() => onToggle(value)}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {label || `${value.slice(0, 5)}...${value.slice(-5)}`}
      {variant === 'selected' && ' ×'}
    </button>
  );
}

export { Toggle, toggleVariants }
