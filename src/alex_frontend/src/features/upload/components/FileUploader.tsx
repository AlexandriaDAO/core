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
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface FileUploaderProps {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileUploader({file, setFile}: FileUploaderProps) {
    const dispatch = useAppDispatch();
    const {actor} = useAlexWallet();

    // Get the spending balance from the swap state
    const { spendingBalance } = useSelector((state: RootState) => state.swap);
    const { type, scanning, estimating, fetching, selecting, uploading, transaction, scanError, lbryFee, paymentStatus } = useAppSelector(state=>state.upload);

    // Check if user has sufficient balance
    const hasInsufficientBalance = lbryFee !== null && Number(spendingBalance) < lbryFee;

    const handleFileUpload = async() => {
        if(!file){
            toast.error('File not available');
            return;
        }
        if(!actor) {
            toast.error('Actor not available');
            return;
        }
        
        // Check if payment is required and has been completed
        if (lbryFee !== null) {
            if (hasInsufficientBalance) {
                toast.error('Insufficient LBRY balance. Please top up your wallet.');
                return;
            }
            
            if (paymentStatus !== 'success') {
                toast.error('Please complete the payment before uploading');
                return;
            }
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

    // Determine if upload button should be disabled
    const isUploadDisabled = !file || 
                            !actor || 
                            estimating || 
                            fetching || 
                            selecting || 
                            uploading || 
                            !!transaction || 
                            !!scanError || 
                            hasInsufficientBalance ||
                            (lbryFee !== null && paymentStatus !== 'success');

    // Determine upload button text
    const getUploadButtonText = () => {
        if (scanning) return "Scanning content...";
        if (scanError) return "Inappropriate content detected";
        if (estimating) return "Estimating...";
        if (fetching) return "Fetching...";
        if (selecting) return "Selecting...";
        if (uploading) return "Uploading...";
        if (transaction) return "Uploaded";
        if (hasInsufficientBalance) return "Insufficient balance";
        if (lbryFee !== null && paymentStatus !== 'success') return "Payment required";
        return "Upload file";
    };

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
                disabled={isUploadDisabled}
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
                ) : hasInsufficientBalance ? (
                    <>Insufficient Balance</>
                ) : lbryFee !== null && paymentStatus !== 'success' ? (
                    <>Payment Required</>
                ) : !!transaction ? <>
                    <Check size={18} className="mr-1"/> Uploaded
                </> : "Upload file"}
            </Button>
        </div>
	);
}

export default FileUploader;
