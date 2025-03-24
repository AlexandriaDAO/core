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
    <div className={`${inline ? "" : "grid gap-4 py-4"}`}>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Shelf Title"
        />
      </div>
      <div className="grid gap-2 mt-4">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </div>
      {!inline && onSubmit && (
        <div className="flex justify-end mt-4">
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      )}
    </div>
  );
};

const NewShelfDialog = ({ isOpen, onClose, onSubmit }: NewShelfDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
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
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewShelfDialog; 