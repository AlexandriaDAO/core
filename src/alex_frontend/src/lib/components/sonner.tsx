import React from "react"
import { useTheme } from "@/providers/ThemeProvider"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group font-roboto-condensed"
      richColors
      toastOptions={{
        classNames: {
          // toast:"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          // description: "group-[.toast]:text-muted-foreground",
          // actionButton:"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          // cancelButton:"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",

          // error: 'group toast group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground dark:group-[.toaster]:text-destructive group-[.toaster]:shadow-lg',
          // success: 'group toast group-[.toaster]:bg-constructive group-[.toaster]:text-constructive-foreground dark:group-[.toaster]:text-constructive group-[.toaster]:shadow-lg',
          // warning: 'group toast group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground dark:group-[.toaster]:text-warning group-[.toaster]:shadow-lg',
          // info: 'group toast group-[.toaster]:bg-info group-[.toaster]:text-info-foreground dark:group-[.toaster]:text-info group-[.toaster]:shadow-lg',

          // toast: "group toast group-[.toaster]:shadow-lg dark:group-[.toaster]:shadow-lg-dark",
          // description: "group-[.toast]:text-muted-foreground dark:group-[.toast]:text-muted-foreground-dark",
          // actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground dark:group-[.toast]:bg-primary-foreground dark:group-[.toast]:text-primary",
          // cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground dark:group-[.toast]:bg-muted-dark dark:group-[.toast]:text-muted-foreground-dark",
        },
      }}
      {...props}
    />
  )
}
export { Toaster }
