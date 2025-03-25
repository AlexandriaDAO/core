import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/lib/components/dropdown-menu";
import { Button } from "@/lib/components/button";

interface ItemActionMenuProps {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

/**
 * A reusable menu component for item actions
 * 
 * This menu is triggered by a three-dots icon button and can contain any number
 * of action menu items as children.
 */
export const ItemActionMenu: React.FC<ItemActionMenuProps> = ({
  children,
  align = "end",
  side = "bottom",
  className
}) => {
  const [open, setOpen] = useState(false);

  const handleTriggerClick = (e: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering card clicks
    e.stopPropagation();
    e.preventDefault();
    setOpen(!open);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`h-8 w-8 p-0 absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-muted ${className}`}
          onClick={handleTriggerClick}
          aria-label="Open actions menu"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        onClick={(e) => e.stopPropagation()}
        className="w-48"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 