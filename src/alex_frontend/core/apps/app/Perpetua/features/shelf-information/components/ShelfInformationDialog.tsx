import React from "react";
import { Button } from "@/lib/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/lib/components/dialog";
import { Info, User, CalendarDays, Hash, Layers, Package } from "lucide-react";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { ShelfLinkItem } from "../../shelf-settings/components/ShelfLinkItem";
import { Principal } from "@dfinity/principal";
import { useUsername } from "@/hooks/useUsername";

interface ShelfInformationDialogProps {
  shelf: ShelfPublic;
  trigger?: React.ReactNode; // Optional custom trigger
  className?: string;
}

const formatDate = (timestampNanos: bigint | number): string => {
  if (typeof timestampNanos === 'number') {
    return new Date(timestampNanos / 1_000_000).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  return new Date(Number(timestampNanos / 1000000n)).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
};

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start space-x-3">
    <Icon className="h-5 w-5 text-muted-foreground mt-1" />
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">{value || "N/A"}</p>
    </div>
  </div>
);

export const ShelfInformationDialog: React.FC<ShelfInformationDialogProps> = ({
  shelf,
  trigger,
  className = "",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const ownerPrincipalString = React.useMemo(() => {
    if (shelf.owner instanceof Principal) return shelf.owner.toText();
    if (typeof shelf.owner === 'string') return shelf.owner;
    return ""; // Fallback for unexpected types
  }, [shelf.owner]);

  const { username: ownerUsername, isLoading: isLoadingOwnerUsername } = useUsername(ownerPrincipalString);

  const createdAt = shelf.created_at ? formatDate(shelf.created_at) : "N/A";
  const updatedAt = shelf.updated_at ? formatDate(shelf.updated_at) : "N/A";
  const itemCount = shelf.items ? String(shelf.items.length) : "N/A";

  const ownerDisplayValue = isLoadingOwnerUsername
    ? "Loading username..."
    : ownerUsername || ownerPrincipalString || "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" className={`flex items-center gap-1 px-3 py-1 text-sm ${className}`}>
            <Info size={16} />
            <span>Info</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md md:max-w-lg font-serif">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="text-2xl font-bold leading-tight break-words">
            {shelf.title}
          </DialogTitle>
          {shelf.description && shelf.description.length > 0 && shelf.description[0] && (
            <DialogDescription className="text-base text-muted-foreground mt-1">
              {shelf.description[0]}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-6 py-1">
          <DetailItem icon={User} label="Owner" value={ownerDisplayValue} />
          <DetailItem icon={CalendarDays} label="Created Date" value={createdAt} />
          <DetailItem icon={CalendarDays} label="Last Updated" value={updatedAt} />
          <DetailItem icon={Package} label="Number of Items" value={itemCount} />
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Hash size={16} />
              Tags
            </h4>
            {shelf.tags && shelf.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {shelf.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-sm whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Layers size={16} />
              Included In Shelves
            </h4>
            {shelf.appears_in && shelf.appears_in.length > 0 ? (
              <ul className="list-none p-0 flex flex-wrap">
                {shelf.appears_in.map((shelfId: string) => (
                  <ShelfLinkItem key={shelfId} shelfId={shelfId} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Not included in any other shelves.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 