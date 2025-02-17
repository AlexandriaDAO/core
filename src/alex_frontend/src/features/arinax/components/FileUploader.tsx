import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAlexWallet, useUser } from "@/hooks/actors";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import uploadFile from "../thunks/uploadFile";
import { setWallet } from "../arinaxSlice";
import { Button } from "@/lib/components/button";

interface FileUploaderProps {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileUploader({file, setFile}: FileUploaderProps) {
    const dispatch = useAppDispatch();
    const {actor} = useUser();

    const {wallet, fetching} = useAppSelector(state=>state.arinax)

    if(!file) return null;

    const handleFileUpload = async() => {
        if(!file){
            toast.error('File not available');
            return;
        }
        if(!wallet) {
            toast.error('Wallet not available');
            return;
        }
        if(!actor) {
            toast.error('Actor not available');
            return;
        }

        dispatch(uploadFile({file, wallet, actor}));
    }

    const handleCancel = () => {
        setFile(null);
        dispatch(setWallet(null));
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
                disabled={!wallet || fetching}
                variant="inverted"
            >
                Upload file
            </Button>
        </div>
	);
}

export default FileUploader;
