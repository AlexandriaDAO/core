import React from "react";
import { FileVideo2, FileImage, Trash, FileMusic, Book } from "lucide-react";
import { AssetType } from "../uploadSlice";

interface AssetPreviewProps {
    asset: File | undefined;
    onDelete: () => void;
    type?: AssetType
    poster?: File | null
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ asset, onDelete, type = AssetType.Book, poster = null }) => {
    if (!asset) {
        return (
            <div className="h-full w-full text-center flex flex-col justify-center items-center">
                <img
                    className="mx-auto w-32"
                    src="/images/no-file.png"
                    alt="no data"
                />
                <span className="text-small text-gray-500">
                    No files selected
                </span>
            </div>
        );
    }

    const formatFileSize = (size: number): string => {
        if (size > 1048576) return Math.round(size / 1048576) + "mb";
        if (size > 1024) return Math.round(size / 1024) + "kb";
        return size + "b";
    };

    const FileIcon = {
        [AssetType.Book]: Book,
        [AssetType.Audio]: FileMusic,
        [AssetType.Video]: FileVideo2,
        [AssetType.Image]: FileImage,
    }[type];

    const renderPreview = () => {
        switch (type) {
            case AssetType.Audio:
                return (
                    <audio
                        controls
                        className="w-full h-14"
                        src={URL.createObjectURL(asset)}
                    >
                        Your browser does not support the audio element.
                    </audio>
                );
            case AssetType.Video:
                return (
                    <video
                        controls
                        className="w-full h-48"
                        src={URL.createObjectURL(asset)}
                    >
                        Your browser does not support the video element.
                    </video>
                );
            case AssetType.Image:
                return (
                    <img
                        src={URL.createObjectURL(asset)}
                        alt={asset.name}
                        className="w-full max-h-60 sticky object-cover rounded-md bg-fixed"
                    />
                );
            case AssetType.Book:
                if(poster) return (
                    <img
                        src={URL.createObjectURL(poster)}
                        alt={asset.name}
                        className="w-full max-h-60 sticky object-cover rounded-md bg-fixed"
                    />
                );
        }
    };

    return (
        <div className="flex flex-col rounded-md text-xs break-words w-full h-full py-2">
            {renderPreview()}
            <div className="flex justify-between items-center p-2">
                <h1 className="flex-1">{asset.name}</h1>
                <div className="flex gap-4 justify-between items-center">
                    <div className="flex gap-1 justify-between items-center">
                        {FileIcon && <FileIcon size={18}/>}
                        <p className="p-1 size text-xs">
                            Size: {formatFileSize(asset.size)}
                        </p>
                    </div>
                    <div onClick={onDelete} className="flex justify-between items-center gap-1 cursor-pointer focus:outline-none hover:bg-gray-300 p-1 rounded-md">
                        <Trash size={18}/>
                        <p className="p-1 size text-xs">Delete</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetPreview; 