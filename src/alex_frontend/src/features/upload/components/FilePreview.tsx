import React from "react";
import { getFileTypeInfo } from "@/features/upload/constants";

interface FilePreviewProps {
    file: File;
}

function FilePreview({ file }: FilePreviewProps) {
    const typeInfo = getFileTypeInfo(file.type);

    return (
        <div className="flex justify-start items-center gap-4">
            <div className="flex-shrink-0 w-28 h-20 flex items-center justify-center border rounded bg-white">
                {typeInfo?.icon || '📁'}
            </div>
            <h3 className="text-lg font-medium truncate">
                {file.name}
            </h3>
        </div>
    );
}

export default FilePreview;