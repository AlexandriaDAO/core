import React, { useEffect, useState } from "react";
import NodeSelector from "./components/NodeSelector";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTextMode, setTransaction } from "./fileUploadSlice";
import FileSelector from "./components/FileSelector";
import FilePreview from "./components/FilePreview";
import UploadProgress from "./components/UploadProgress";
import UploadSuccess from "./components/UploadSuccess";
import UploadError from "./components/UploadError";
import estimateCost from "./thunks/estimateCost";
import FileUploader from "./components/FileUploader";
import mintNFT from "./thunks/mintNFT";
import useNftManager from "@/hooks/actors/useNftManager";
import { Button } from "@/lib/components/button";
import { ArrowUpToLine, FileText } from "lucide-react";
import TextEditor from "./components/TextEditor";

function FileUpload() {
    const dispatch = useAppDispatch();
    const {actor} = useNftManager();
    const [file, setFile] = useState<File | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const { transaction, uploading, uploadError, textMode } = useAppSelector(state => state.fileUpload);

    useEffect(() => {
        if (!file) return;

        dispatch(setTransaction(null));
        dispatch(estimateCost({ file }));
    }, [file, dispatch]);

    useEffect(() => {
        if (!transaction) return;

        setUploadedFile(file);
        setFile(null);
    }, [transaction]);


    useEffect(()=>{
        if(!transaction || !actor) return;

        dispatch(mintNFT({actor}));
    }, [transaction, actor]);

    const renderContent = () => {
        if (uploading) return <UploadProgress file={file} />;

        if (file) return (
            <div className="space-y-10">
                <FilePreview file={file} />
                <NodeSelector />
                <FileUploader file={file} setFile={setFile} />
            </div>
        );

        if (textMode) return <TextEditor setFile={setFile} />;

        return <FileSelector setFile={setFile} />;
    };

    return (
        <div className="w-full">
            <div className="space-y-6 max-w-2xl mx-auto">
                {uploadedFile && transaction && <UploadSuccess file={uploadedFile}/>}

                {uploadError && file && <UploadError file={file}/>}

                <div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-8 border border-border">
                    {renderContent()}
                </div>

            </div>
        </div>
	);
}

export default FileUpload;
