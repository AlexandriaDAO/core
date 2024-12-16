import React, { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { useDragDrop } from "@/features/upload/hooks/useDragDrop";
import { useFileUpload } from "@/features/upload/hooks/useFileUpload";
import { Button } from "@/lib/components/button";
import { DialogClose } from "@/lib/components/dialog";
import { toast } from "sonner";
import { useUploader } from "@/hooks/useUploader";
import { createFileTransaction } from "@/services/uploadService";
import OpagueHolder from "@/features/upload/components/OpagueHolder";
import AssetPreview from "@/features/upload/components/AssetPreview";
import { AssetType, nextScreen, previousScreen, setLoading, setNode, setOpen, setScreen } from "../../uploadSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const Asset = () => {
    const dispatch = useAppDispatch();
    const { irys, asset, setAsset } = useUploader()

    const { node, loading } = useAppSelector(state=>state.upload);

    const {
        file: audio,
        setFile: setAudio,
        hiddenFileInput,
        handleHiddenInputClick,
        handleDeleteFile,
        handleFileChange
    } = useFileUpload({
        onFileSelect: (file) => setAudio(file),
        acceptedFileTypes: 'audio/*'
    });

    const { drag, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } = useDragDrop({
        onFileDrop: (file) => setAudio(file)
    });

	const handleAssetSubmit = async() => {
        try {
            dispatch(setLoading(true));
            if (!audio) {
                toast.info('Please select an audio')
                return;
            }
            if (!irys) {
                toast.info('Irys is not available')
                return;
            }
            const tx = await createFileTransaction(audio, irys);

            setAsset(tx);

        } catch (error) {
            toast.error('Failed to create asset transaction');
            console.error(`Error: `, error);
            setAsset(null);
        }finally{
            dispatch(setLoading(false))
        }
	};

    useEffect(() => {
        // if asset is available, move on to next screen
        if (asset) dispatch(nextScreen());
        // if node is not available, move on to previous screen
        if (!node) dispatch(previousScreen());
    }, [asset, node, setScreen]);


	return (
        <div className="flex flex-col gap-2">
            <OpagueHolder loading={loading}>
                <p className="text-sm font-roboto-condensed">Upload your asset here</p>
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
                        accept="audio/*"
                        onChange={handleFileChange}
                    />
                    <p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
                        <span>Drag and drop your</span>
                        &nbsp;
                        <span>audio anywhere or</span>
                    </p>
                    <button
                        onClick={handleHiddenInputClick}
                        className="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none"
                    >
                        Upload a file
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
                    Asset to Upload
                </h1>

                <AssetPreview type={AssetType.Audio} asset={audio} onDelete={handleDeleteFile} />
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
                        <Button onClick={handleAssetSubmit} type="button" disabled={!audio} variant={!audio ? "inverted" : "info"}>
                            Next
                        </Button>
                    }
					<Button
						type="button"
						variant="secondary"
						onClick={() => dispatch(setNode(null))}
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

export default Asset;
