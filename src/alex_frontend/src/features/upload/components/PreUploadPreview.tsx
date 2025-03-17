import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import NoFile from "./NoFile";
import FilePreview from "./FilePreview";
import FileInfo from "./FileInfo";
import UploadProgress from "./UploadProgress";
import FileCost from "./FileCost";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setPreUploadPreview } from "../uploadSlice";

interface PreUploadPreviewProps {
    file: File | null;
}

function PreUploadPreview({ file }: PreUploadPreviewProps) {
    const { preUploadPreview } = useAppSelector(state => state.upload);
    const dispatch = useAppDispatch();

    return (
        <div className="w-full font-roboto-condensed space-y-1">
            <button
                onClick={() => dispatch(setPreUploadPreview(!preUploadPreview))}
                className="w-full font-syne text-xl flex items-center justify-between hover:opacity-70 transition-opacity"
            >
                <h2 className="text-xl font-semibold">Selected File</h2>
                <span className="text-sm">
                    {preUploadPreview ? (
                        <ChevronUp
                            className="w-6 h-6"
                            strokeWidth={2}
                        />
                    ) : (
                        <ChevronDown
                            className="w-6 h-6"
                            strokeWidth={2}
                        />
					)}
				</span>
            </button>

            {preUploadPreview && (file ?
                <div className="flex flex-col items-stretch gap-4">
                    <FilePreview file={file} />
                    <UploadProgress />
                    <FileInfo file={file} />
                    <FileCost />
                </div>
            : <NoFile />)}
        </div>
    );
}

export default PreUploadPreview;