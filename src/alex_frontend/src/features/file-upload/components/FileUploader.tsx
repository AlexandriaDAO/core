import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAlexWallet } from "@/hooks/actors";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import uploadFile from "../thunks/uploadFile";
import { setNode } from "../fileUploadSlice";
import { Button } from "@/lib/components/button";

interface FileUploaderProps {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileUploader({file, setFile}: FileUploaderProps) {
    const dispatch = useAppDispatch();
    const {actor} = useAlexWallet();

    const {node, fetching} = useAppSelector(state=>state.fileUpload)

    if(!file) return null;

    const handleFileUpload = async() => {
        if(!file){
            toast.error('File not available');
            return;
        }
        if(!node) {
            toast.error('Node not available');
            return;
        }
        if(!actor) {
            toast.error('Actor not available');
            return;
        }

        dispatch(uploadFile({file, node, actor}));
    }

    const handleCancel = () => {
        setFile(null);
        dispatch(setNode(null));
    }

	return (
        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <Button
                onClick={handleCancel}
                variant="muted"
            >
                Cancel
            </Button>
            <Button
                onClick={handleFileUpload}
                disabled={!node || fetching}
                variant="inverted"
            >
                Upload file
            </Button>
        </div>
	);
}

export default FileUploader;
