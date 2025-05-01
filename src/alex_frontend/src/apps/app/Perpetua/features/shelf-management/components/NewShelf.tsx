import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/lib/components/dialog";
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

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export const ShelfForm: React.FC<ShelfFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  submitLabel = "Create",
  onSubmit,
  inline = false
}) => {
  const titleLength = title.length;
  const descriptionLength = description.length;

  return (
    <div className={inline ? "" : "space-y-6"}>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="title">Title</Label>
          <span className={`text-xs ${titleLength > MAX_TITLE_LENGTH ? 'text-red-500' : 'text-muted-foreground'}`}>
            {titleLength}/{MAX_TITLE_LENGTH}
          </span>
        </div>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ideas worth sharing..."
          maxLength={MAX_TITLE_LENGTH}
        />
      </div>
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <Label htmlFor="description">Description</Label>
            <span className={`text-xs ${descriptionLength > MAX_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-muted-foreground'}`}>
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
            </span>
         </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="min-h-[100px]"
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
      </div>
      {!inline && onSubmit && (
        <Button
          onClick={onSubmit}
          className="w-full sm:w-auto"
          disabled={titleLength === 0 || titleLength > MAX_TITLE_LENGTH || descriptionLength > MAX_DESCRIPTION_LENGTH}
        >
          {submitLabel}
        </Button>
      )}
    </div>
  );
};

const NewShelfDialog: React.FC<NewShelfDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDialogClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || isLoading || title.length > MAX_TITLE_LENGTH || description.length > MAX_DESCRIPTION_LENGTH) return;

    setIsLoading(true);

    try {
      await onSubmit(title, description);
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to create shelf:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
    } else {
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shelf</DialogTitle>
          <DialogDescription>
            Just enter something. You could change it later.
          </DialogDescription>
        </DialogHeader>
        
        <ShelfForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          inline={true}
        />
        
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isLoading || title.length > MAX_TITLE_LENGTH || description.length > MAX_DESCRIPTION_LENGTH}
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewShelfDialog; 