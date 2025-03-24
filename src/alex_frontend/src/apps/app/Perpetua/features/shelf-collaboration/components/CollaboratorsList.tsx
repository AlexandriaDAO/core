import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { 
  selectShelfEditors, 
  selectEditorsLoading, 
  selectIsOwner,
  selectUserPrincipal 
} from '@/apps/Modules/shared/state/perpetua/perpetuaSlice';
import { 
  listShelfEditors, 
  addShelfEditor, 
  removeShelfEditor 
} from '@/apps/Modules/shared/state/perpetua/perpetuaThunks';
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/lib/components/card";
import { PlusCircle, User, Trash2, Users } from "lucide-react";
import { toast } from 'sonner';

interface CollaboratorsListProps {
  shelfId: string;
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ shelfId }) => {
  const dispatch = useAppDispatch();
  const editors = useAppSelector(selectShelfEditors(shelfId));
  const isLoading = useAppSelector(selectEditorsLoading(shelfId));
  const isOwner = useAppSelector(selectIsOwner(shelfId));
  const userPrincipal = useAppSelector(selectUserPrincipal);
  
  const [newEditor, setNewEditor] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
  
  // Load editors when component mounts
  useEffect(() => {
    dispatch(listShelfEditors(shelfId));
  }, [dispatch, shelfId]);
  
  const handleAddEditor = async () => {
    if (!newEditor.trim()) {
      toast.error("Please enter a valid principal ID");
      return;
    }
    
    setIsAdding(true);
    try {
      const resultAction = await dispatch(addShelfEditor({
        shelfId,
        editorPrincipal: newEditor.trim()
      }));
      
      if (addShelfEditor.fulfilled.match(resultAction)) {
        toast.success("Editor added successfully");
        setNewEditor('');
      } else if (addShelfEditor.rejected.match(resultAction)) {
        toast.error(resultAction.payload as string || "Failed to add editor");
      }
    } catch (error) {
      toast.error("Failed to add editor");
    }
    setIsAdding(false);
  };
  
  const handleRemoveEditor = async (editorPrincipal: string) => {
    setIsRemoving(prev => ({ ...prev, [editorPrincipal]: true }));
    
    try {
      const resultAction = await dispatch(removeShelfEditor({
        shelfId,
        editorPrincipal
      }));
      
      if (removeShelfEditor.fulfilled.match(resultAction)) {
        toast.success("Editor removed successfully");
      } else if (removeShelfEditor.rejected.match(resultAction)) {
        toast.error(resultAction.payload as string || "Failed to remove editor");
      }
    } catch (error) {
      toast.error("Failed to remove editor");
    }
    
    setIsRemoving(prev => ({ ...prev, [editorPrincipal]: false }));
  };
  
  // Truncate principal ID for display
  const formatPrincipal = (principal: string) => {
    if (principal.length <= 10) return principal;
    return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={18} />
          Collaborators
        </CardTitle>
        <CardDescription>
          Manage who can edit this shelf
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading collaborators...</div>
        ) : (
          <>
            {editors.length === 0 ? (
              <div className="text-center py-2 text-muted-foreground">
                No collaborators yet
              </div>
            ) : (
              <ul className="space-y-2">
                {editors.map((editor: string) => (
                  <li key={editor} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="text-sm" title={editor}>
                        {formatPrincipal(editor)}
                        {editor === userPrincipal && " (you)"}
                      </span>
                    </div>
                    
                    {isOwner && editor !== userPrincipal && (
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-sm"
                        onClick={() => handleRemoveEditor(editor)}
                        disabled={isRemoving[editor]}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            
            {isOwner && (
              <div className="mt-4">
                <Label htmlFor="new-editor">Add collaborator</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="new-editor"
                    placeholder="Principal ID"
                    value={newEditor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEditor(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleAddEditor} 
                    disabled={isAdding || !newEditor.trim()}
                    className="flex-shrink-0"
                  >
                    <PlusCircle size={16} className="mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {!isOwner && userPrincipal && editors.includes(userPrincipal) && (
        <CardFooter className="border-t pt-4">
          <div className="text-sm text-muted-foreground">
            You are a collaborator on this shelf
          </div>
        </CardFooter>
      )}
    </Card>
  );
}; 