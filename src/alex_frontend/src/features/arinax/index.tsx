import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTransaction } from "./arinaxSlice";
import FileSelector from "./components/FileSelector";
import FilePreview from "./components/FilePreview";
import UploadProgress from "./components/UploadProgress";
import UploadSuccess from "./components/UploadSuccess";
import UploadError from "./components/UploadError";
import estimateCost from "./thunks/estimateCost";
import FileUploader from "./components/FileUploader";
import mintNFT from "./thunks/mintNFT";
import useNftManager from "@/hooks/actors/useNftManager";
import TextEditor from "./components/TextEditor";
function Arinax() {
    const dispatch = useAppDispatch();
    const {actor} = useNftManager();
    const [file, setFile] = useState<File | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const { transaction, fetching, selecting, uploading, uploadError, textMode, fetchError, selectError } = useAppSelector(state => state.arinax);

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

    // Handle any error state
    if (uploadError || fetchError || selectError) {
        return <UploadError file={file} error={uploadError || fetchError || selectError } />;
    }

    if (uploadedFile && transaction) return <UploadSuccess file={uploadedFile}/>;

    if(fetching || selecting || uploading) return (
        <div className="space-y-10">
            <FilePreview file={file} />
            <UploadProgress file={file} />
        </div>
    );

    if(file) return (
        <div className="space-y-6 font-roboto-condensed bg-secondary rounded shadow-sm p-8 border">
            <FilePreview file={file} />
            <FileUploader file={file} setFile={setFile} />
        </div>
    );

    if(textMode) return <TextEditor setFile={setFile} />;

    return <FileSelector setFile={setFile} />
}

export default Arinax;
