import React, { useEffect, useRef, useState } from "react";
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
import { AssetType, nextScreen, previousScreen, setLoading, setMetadata, setNode, setOpen, setScreen } from "../../uploadSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Epub from "epubjs";

const Asset = () => {
    const dispatch = useAppDispatch();
    const { irys, asset, poster, setAsset, setPoster } = useUploader()

    const { node, loading } = useAppSelector(state=>state.upload);

    const {
        file,
        setFile,
        hiddenFileInput,
        handleHiddenInputClick,
        handleDeleteFile,
        handleFileChange
    } = useFileUpload({
        onFileSelect: (uploadedFile) => setFile(uploadedFile),
        acceptedFileTypes: '.epub'
    });

    const { drag, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } = useDragDrop({
        onFileDrop: (droppedFile) => setFile(droppedFile)
    });

    const bookAreaRef = useRef<HTMLDivElement>(null);
    const [book, setBook] = useState<any>(null);

    useEffect(() => {
        // if asset is available, move on to next screen
        if (asset) dispatch(nextScreen());
        // if node is not available, move on to previous screen
        if (!node) dispatch(previousScreen());
    }, [asset, node, setScreen]);

    useEffect(() => {
        if(!file) {
            setBook(null);
            return;
        }

        // Load and render the EPUB file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (bookAreaRef.current && e.target?.result) {
                    // Initialize the ePub reader with the book URL
                    let book = Epub(e.target?.result);

                    // Render the book off-scr`een or hidden
                    book.renderTo(bookAreaRef.current, {
                        width: 0,
                        height: 0,
                    });
                    setBook(book);
                }
            } catch (error) {
                console.error("error", error);
                toast.error('Failed to load book');
                setBook(null);
            }
        };
        reader.readAsArrayBuffer(file);
	}, [file]);

    useEffect(() => {
        if(!book) {
            setPoster(null);
            return;
        }

        book.loaded.metadata.then((metadata: any) => {
            dispatch(setMetadata({
                title: metadata?.title ?? '',
                creator: metadata?.creator ?? '',
                fiction: metadata?.fiction ?? false,
                language: metadata?.language ?? 'en',
            }))
        });

        const posterUrl = book.coverUrl().then(async (coverPath: string) => {
            if(!coverPath) throw new Error('Cover not available');
            const response = await fetch(coverPath);
            const blob = await response.blob();
            const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
            setPoster(file);
        }).catch((error: Error) => {
            toast.error('Unable to fetch Book Cover');
            console.error('Error fetching cover:', error);
            setPoster(null);
        })

        // book.loaded.cover.then((coverPath: string) => {
        //     book.archive.createUrl(coverPath).then((url: string) => {
        //         dispatch(setCover(url));
        //     });
        // });
	}, [book]);


    const handleAssetSubmit = async() => {
        try {
            dispatch(setLoading(true));
            if (!file) {
                toast.info('Please select a book')
                return;
            }
            if (!irys) {
                toast.info('Irys is not available')
                return;
            }
            const tx = await createFileTransaction(file, irys);

            setAsset(tx);

        } catch (error) {
            toast.error('Failed to create asset transaction');
            console.error(`Error: `, error);
            setAsset(null);
        }finally{
            dispatch(setLoading(false))
        }
	};

    const handleDelete = ()=>{
        handleDeleteFile();
        setBook(null);
        setPoster(null);
    }


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
                        accept=".epub"
                        onChange={handleFileChange}
                    />
                    <p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
                        <span>Drag and drop your</span>
                        &nbsp;
                        <span>book anywhere or</span>
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

                <div ref={bookAreaRef}></div>

                <AssetPreview type={AssetType.Book} asset={file} poster={poster} onDelete={handleDelete} />
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
                        <Button onClick={handleAssetSubmit} type="button" disabled={!book} variant={!book ? "inverted" : "info"}>
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
