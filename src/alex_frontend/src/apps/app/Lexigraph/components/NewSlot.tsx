import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Shelf } from "../../../../../../declarations/lexigraph/lexigraph.did";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewSlotDialogProps extends DialogProps {
  onSubmit: (content: string, type: "Nft" | "Markdown" | "Shelf") => Promise<void>;
  shelves?: Shelf[];
}

const NewSlotDialog = ({ isOpen, onClose, onSubmit, shelves }: NewSlotDialogProps) => {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"Nft" | "Markdown" | "Shelf">("Markdown");
  const [selectedShelfId, setSelectedShelfId] = useState<string>("");

  const handleSubmit = async () => {
    // If type is Shelf, use the selected shelf ID as content
    const finalContent = type === "Shelf" ? selectedShelfId : content;
    await onSubmit(finalContent, type);
    setContent("");
    setSelectedShelfId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Slot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Content Type</Label>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant={type === "Markdown" ? "primary" : "outline"}
                onClick={() => setType("Markdown")}
              >
                Markdown
              </Button>
              <Button
                variant={type === "Nft" ? "primary" : "outline"}
                onClick={() => setType("Nft")}
              >
                NFT
              </Button>
              <Button
                variant={type === "Shelf" ? "primary" : "outline"}
                onClick={() => setType("Shelf")}
              >
                Shelf
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            {type === "Markdown" ? (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter markdown content..."
              />
            ) : type === "Nft" ? (
              <Input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter NFT ID..."
              />
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="shelfSelect">Select a Shelf</Label>
                <select
                  id="shelfSelect"
                  value={selectedShelfId}
                  onChange={(e) => setSelectedShelfId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a shelf...</option>
                  {shelves?.map((shelf) => (
                    <option key={shelf.shelf_id} value={shelf.shelf_id}>
                      {shelf.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={type === "Shelf" && !selectedShelfId}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewSlotDialog; 