import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAlexWallet } from "@/hooks/actors";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import uploadFile from "../thunks/uploadFile";
import { reset, setContentType, setFileSelector, setTextEditor, ContentType } from "../uploadSlice";
import { Button } from "@/lib/components/button";
import fetchWallets from "../thunks/fetchWallets";
import selectWallet from "../thunks/selectWallet";
import { Check } from "lucide-react";

interface FileUploaderProps {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileUploader({file, setFile}: FileUploaderProps) {
    const dispatch = useAppDispatch();
    const {actor} = useAlexWallet();

    const { type, scanning, estimating, fetching, selecting, uploading, transaction, scanError } = useAppSelector(state=>state.upload);

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
        const contentType = type;

        setFile(null);
        dispatch(reset());

        dispatch(setContentType(contentType));
        dispatch(setFileSelector(contentType == ContentType.Local));
        dispatch(setTextEditor(contentType == ContentType.Manual));
    }

    const handleUpload = () => {
        // Prevent upload if NSFW content detected
        if (scanError) {
            return;
        }

        handleFileUpload();
    }

	return (
        <div className="w-full flex justify-between items-center">
            <Button
                disabled={fetching || selecting || uploading || !!transaction}
                onClick={handleCancel}
                variant="outline"
                className="dark:bg-[#3A3630]"
            >
                Cancel
            </Button>
            <Button
                onClick={handleUpload}
                disabled={!file || !actor || estimating || fetching || selecting || uploading || !!transaction || !!scanError }
                variant="inverted"
            >
                {scanning ? (
                    <>Scanning content...</>
                ) : scanError ? (
                    <>Inappropriate content detected</>
                ) : estimating ? (
                    <>Estimating...</>
                ) : fetching ? (
                    <>Fetching...</>
                ) : selecting ? (
                    <>Selecting...</>
                ) : uploading ? (
                    <>Uploading...</>
                ) : !!transaction ? <>
                    <Check size={18} className="mr-1"/> Uploaded
                </> : "Upload file"}
            </Button>
        </div>
	);
}

export default FileUploader;
