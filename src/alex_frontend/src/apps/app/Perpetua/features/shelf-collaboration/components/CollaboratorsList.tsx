import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { 
  selectShelfEditors, 
  selectEditorsLoading, 
  selectIsOwner,
  selectIsShelfPublic
} from '@/apps/app/Perpetua/state/perpetuaSlice';
import { 
  listShelfEditors, 
  addShelfEditor, 
  removeShelfEditor 
} from '@/apps/app/Perpetua/state';
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/lib/components/card";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { PlusCircle, User, Trash2, Users, Globe, AlertCircle } from "lucide-react";
import { toast } from 'sonner';

interface CollaboratorsListProps {
  shelfId: string;
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ shelfId }) => {
  const dispatch = useAppDispatch();
  
  // Memoize selector references to prevent recreation on each render
  const editorsSelector = useMemo(() => selectShelfEditors(shelfId), [shelfId]);
  const editorsLoadingSelector = useMemo(() => selectEditorsLoading(shelfId), [shelfId]);
  const isOwnerSelector = useMemo(() => selectIsOwner(shelfId), [shelfId]);
  const isPublicSelector = useMemo(() => selectIsShelfPublic(shelfId), [shelfId]);
  
  // Use memoized selectors
  const editors = useAppSelector(editorsSelector) as string[];
  const isLoading = useAppSelector(editorsLoadingSelector) as boolean;
  const isOwner = useAppSelector(isOwnerSelector) as boolean;
  const isPublic = useAppSelector(isPublicSelector) as boolean;
  
  // Direct state access to auth principal - single source of truth
  const userPrincipal = useAppSelector(state => state.auth.user?.principal);
  
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
          {isPublic 
            ? "Anyone can edit this shelf (public access is enabled)"
            : "Manage who can edit this shelf"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isPublic && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Globe className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              This shelf is publicly editable. Anyone with the link can make changes without logging in.
            </AlertDescription>
          </Alert>
        )}
      
        {isLoading ? (
          <div className="text-center py-4">Loading collaborators...</div>
        ) : (
          <>
            {!isPublic && editors.length === 0 ? (
              <div className="text-center py-2 text-muted-foreground">
                No collaborators yet
              </div>
            ) : (
              <ul className="space-y-2">
                {isPublic && (
                  <li className="flex items-center justify-between p-2 rounded bg-blue-50/50">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">
                        Public Access
                      </span>
                    </div>
                    <div className="text-xs text-blue-600">
                      Anyone can edit
                    </div>
                  </li>
                )}
                
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
            
            {isOwner && !isPublic && (
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