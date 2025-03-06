import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useUser } from "@/hooks/actors";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import uploadFile from "../thunks/uploadFile";
import { reset } from "../uploadSlice";
import { Button } from "@/lib/components/button";
import fetchWallets from "../thunks/fetchWallets";
import selectWallet from "../thunks/selectWallet";

interface FileUploaderProps {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileUploader({file, setFile}: FileUploaderProps) {
    const dispatch = useAppDispatch();
    const {actor} = useUser();

    const {cost} = useAppSelector(state=>state.upload)

    const handleFileUpload = async() => {
        if(!file){
            toast.error('File not available');
            return;
        }

        if(!actor) {
            toast.error('Actor not available');
            return;
        }

        try {
            // Fetch wallets
            const fetchedWallets = await dispatch(fetchWallets(actor)).unwrap();
            if (fetchedWallets.length === 0) {
                toast.error('No wallets available');
                return;
            }

            // Select suitable wallet
            const selectedWallet = await dispatch(selectWallet()).unwrap();
            if (!selectedWallet) {
                toast.error('No suitable wallet found');
                return;
            }

            // Upload file
            await dispatch(uploadFile({file, actor})).unwrap();
        } catch (error: any) {
            toast.error(error.message || 'Upload process failed');
            // The error message is already handled in the slice reducers
            // but we stop the sequential flow here
            console.error('Upload process failed:', error);
        }
    }

    const handleCancel = () => {
        setFile(null);
        dispatch(reset());
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
                disabled={!cost}
                variant="inverted"
            >
                Upload file
            </Button>
        </div>
	);
}

export default FileUploader;
