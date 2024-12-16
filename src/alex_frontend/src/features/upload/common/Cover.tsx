import React, { useEffect } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useDragDrop } from "@/features/upload/hooks/useDragDrop";
import { useFileUpload } from "@/features/upload/hooks/useFileUpload";
import { DialogClose } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { useUploader } from "@/hooks/useUploader";
import { createFileTransaction } from "@/services/uploadService";
import OpagueHolder from "@/features/upload/components/OpagueHolder";
import AssetPreview from "@/features/upload/components/AssetPreview";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { AssetType, nextScreen, previousScreen, setLoading, setOpen } from "../uploadSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const Cover = () => {
    const dispatch = useAppDispatch();
    const {irys, asset, poster, cover: coverTx, setCover:setCoverTx, setAsset} = useUploader();
    const {loading} = useAppSelector(state => state.upload);

    useEffect(()=>{
        if(poster) setCover(poster);
    }, [poster])

    const {
        file: cover,
        setFile: setCover,
        hiddenFileInput,
        handleHiddenInputClick,
        handleDeleteFile,
        handleFileChange
    } = useFileUpload({
        onFileSelect: (file) => setCover(file),
        acceptedFileTypes: 'image/*'
    });

    const { drag, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } = useDragDrop({
        onFileDrop: (file) => setCover(file)
    });

    const handleCoverSubmit = async()=>{
        try {
            dispatch(setLoading(true));
            if (!cover) {
                toast.info('Please select a Cover')
                return;
            }
            if (!irys) {
                toast.info('Irys is not available')
                return;
            }
            const tx = await createFileTransaction(cover, irys);

            setCoverTx(tx);
        } catch (error) {
            toast.error('Failed to create cover transaction');
            console.error(`Error: `, error);
            setCoverTx(null);
        }finally{
            dispatch(setLoading(false))
        }
    }

    useEffect(() => {
        if (coverTx) dispatch(nextScreen());
        if (!asset) dispatch(previousScreen());
    }, [coverTx, asset, dispatch]);

    return (
        <div className="flex flex-col gap-2">
            <OpagueHolder loading={loading}>
                <p className="text-sm font-roboto-condensed">Upload your Cover here</p>
                <div
                    className={`border-dashed border-2 ${
                        drag !== 0
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-400"
                    } py-12 flex flex-col justify-center items-center`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={hiddenFileInput}
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
                        <span>Drag and drop your</span>
                        &nbsp;
                        <span>cover anywhere or</span>
                    </p>
                    <button
                        onClick={handleHiddenInputClick}
                        className="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none"
                    >
                        Upload an Image
                    </button>
                    {drag !== 0 && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <p className="text-white text-lg">
                                Drop the file here...
                            </p>
                        </div>
                    )}
                </div>

                <h1 className="font-semibold sm:text-lg text-gray-900">
                    Cover to upload
                </h1>

                <AssetPreview type={AssetType.Image} asset={cover} onDelete={handleDeleteFile} />
            </OpagueHolder>

            <footer className="flex justify-between items-center">
                <div className="flex justify-start gap-2 items-center">
                    {loading ?
                        <Button type="button" disabled={true} variant="inverted">
                            <LoaderCircle
                                size={18}
                                className="animate animate-spin"
                            />
                            <span>
                                Processing...
                            </span>
                        </Button>:
                        <Button onClick={handleCoverSubmit} type="button" disabled={!cover} variant={!cover ? "inverted" : "info"}>
                            Next
                        </Button>
                    }
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={()=>setAsset(null)}
                    >
                        Previous
                    </Button>
                </div>

                <DialogClose asChild>
                    <Button onClick={()=>dispatch(setOpen(false))} type="button" variant="outline">Close</Button>
                </DialogClose>
            </footer>
        </div>
	);
};

export default Cover;
