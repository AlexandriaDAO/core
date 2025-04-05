import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewShelfDialogProps extends DialogProps {
  onSubmit: (title: string, description: string) => Promise<void>;
}

// Extracted reusable form component
export interface ShelfFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  submitLabel?: string;
  onSubmit?: () => void;
  inline?: boolean;
}

export const ShelfForm: React.FC<ShelfFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  submitLabel = "Create",
  onSubmit,
  inline = false
}) => {
  return (
    <div className={inline ? "" : "space-y-6"}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Shelf Title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="min-h-[100px]"
        />
      </div>
      {!inline && onSubmit && (
        <Button onClick={onSubmit} className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      )}
    </div>
  );
};

const NewShelfDialog: React.FC<NewShelfDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    await onSubmit(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shelf</DialogTitle>
        </DialogHeader>
        
        <ShelfForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          inline={true}
        />
        
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewShelfDialog; 