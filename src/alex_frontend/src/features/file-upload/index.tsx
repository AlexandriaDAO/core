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

        return (
            <div className="space-y-4">
                <div className="flex justify-center gap-4">
                    <Button
                        onClick={() => dispatch(setTextMode(false))}
                        variant={!textMode ? "inverted" : "outline"}
                        className="w-40"
                    >
                        <ArrowUpToLine className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                    <Button
                        onClick={() => dispatch(setTextMode(true))}
                        variant={textMode ? "inverted" : "outline"}
                        className="w-40"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Create Text
                    </Button>
                </div>

                {textMode ? <TextEditor setFile={setFile} /> : <FileSelector setFile={setFile} />}
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="space-y-6 max-w-2xl mx-auto">
                {uploadedFile && transaction && <UploadSuccess file={uploadedFile}/>}

                {uploadError && file && <UploadError file={file}/>}

                <div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-8">
                    {renderContent()}
                </div>

            </div>
        </div>
	);
}

export default FileUpload;
