import React, { useEffect, useState } from "react";
import NodeSelector from "./components/NodeSelector";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setNode, setTransaction } from "./fileUploadSlice";
import FileUploader from "./components/FileUploader";
import FilePreview from "./components/FilePreview";
import UploadProgress from "./components/UploadProgress";
import { useAlexWallet } from "@/hooks/actors";
import { toast } from "sonner";
import UploadSuccess from "./components/UploadSuccess";
import UploadError from "./components/UploadError";
import uploadFile from "./thunks/uploadFile";
import estimateCost from "./thunks/estimateCost";
import { formatAmount } from "./utils";

function FileUpload() {
    const dispatch = useAppDispatch();
    const {actor} = useAlexWallet();

	const [file, setFile] = useState<File | null>(null);

	const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);

    const {node, transaction, fetching, uploading, uploadError} = useAppSelector(state=>state.fileUpload)

    useEffect(()=>{
        if(file){
            dispatch(setTransaction(null));
            dispatch(estimateCost({file}));
        }
    }, [file]);


    useEffect(()=>{
        if(transaction){
            setFile(null)
            setLastUploadedFile(file);
        }
    }, [transaction]);

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

	return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Status Messages */}
            {lastUploadedFile && transaction && <UploadSuccess file={lastUploadedFile}/>}

            {uploadError && file && <UploadError file={file}/>}

            {/* File Uploader Component */}
            <div className="font-roboto-condensed bg-white rounded-lg shadow-md p-8">
                {/* Upload Progress */}
                {file && node && uploading && <UploadProgress file={file} />}

                {/* File Selection and Node List */}
                {!uploading && (
                    <>
                        {!file ? <FileUploader setFile={setFile}/> : (
                            <div className="space-y-6">
                                <FilePreview file={file} />

                                <NodeSelector />

                                <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                    <button
                                        onClick={() => {
                                            setFile(null);
                                            dispatch(setNode(null));
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleFileUpload}
                                        disabled={!node || fetching}
                                        className={`px-4 py-2 rounded-lg ${
                                            node && !fetching
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        } transition-colors`}
                                    >
                                        Upload file
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
	);
}

export default FileUpload;
