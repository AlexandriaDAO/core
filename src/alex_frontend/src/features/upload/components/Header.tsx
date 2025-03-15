import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setContentType, setTextEditor, setFileSelector, setPostUploadPreview } from "@/features/upload/uploadSlice";
import { Button } from "@/lib/components/button";
import { ContentType } from "@/features/upload/uploadSlice";
import { Step } from "@/features/upload/uploadSlice";

function Header() {
	const dispatch = useAppDispatch();
	const { type, step, fetching, selecting, uploading } = useAppSelector(state => state.upload);

    const handleUploadAssetsClick = () => {
        // setFile(null);
        dispatch(setContentType(ContentType.Local));
        dispatch(setFileSelector(true));
        dispatch(setPostUploadPreview(false));
    }

    const handleCreateTextClick = () => {
        // setFile(null);
        dispatch(setContentType(ContentType.Manual));
        dispatch(setTextEditor(true));
        dispatch(setPostUploadPreview(false));
    }

	return (
        <>
            <div className="flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold">Pinax</h2>
                <p className="">An app for uploading and minting NFTs.</p>
            </div>

            <div className={`flex justify-center items-center gap-4 ${fetching || selecting || uploading ? 'cursor-not-allowed' : ''}`}>
                <Button className={`${fetching || selecting || uploading ? 'pointer-events-none' : ''}`} variant={type == ContentType.Manual ? "primary" : "inverted"} disabled={type == ContentType.Local} rounded="full" onClick={handleUploadAssetsClick}>
                    Upload Assets
                </Button>
                <Button className={`${fetching || selecting || uploading ? 'pointer-events-none' : ''}`} variant={type == ContentType.Manual ? "inverted" : "primary"} disabled={type == ContentType.Manual} rounded="full" onClick={handleCreateTextClick}>
                    Create Text
                </Button>
            </div>

            {/* steps */}
            <div className="w-full flex justify-center items-center gap-6">
                <div className={`flex justify-center items-center gap-2 ${step >= Step.Select ? '' : 'opacity-40'}`}>
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-foreground"><span className='font-sans text-xs'>1</span></div>
                    <span className="text-sm font-syne font-normal">{type == ContentType.Local ? 'Select' : 'Create'}</span>
                </div>

                <hr className={`flex-grow border-t ${step >= Step.Preview ? 'border-foreground' : 'border-foreground/40'}`} />

                <div className={`flex justify-center items-center gap-2 ${step >= Step.Preview ? '' : 'opacity-40'}`}>
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-foreground"><span className='font-sans text-xs'>2</span></div>
                    <span className="text-sm font-syne font-normal text-foreground">Preview</span>
                </div>

                <hr className={`flex-grow border-t ${step >= Step.Success ? 'border-foreground' : 'border-foreground/40'}`} />

                <div className={`flex justify-center items-center gap-2 ${step >= Step.Success ? '' : 'opacity-40'}`}>
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-foreground"><span className='font-sans text-xs'>3</span></div>
                    <span className="text-sm font-syne font-normal text-foreground">Success</span>
                </div>
            </div>
        </>
	);
}

export default Header;