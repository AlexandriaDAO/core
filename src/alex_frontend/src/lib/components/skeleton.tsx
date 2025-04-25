import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-300/70 dark:bg-gray-700/70", className)}
      {...props}
    />
  )
}

export { Skeleton }
