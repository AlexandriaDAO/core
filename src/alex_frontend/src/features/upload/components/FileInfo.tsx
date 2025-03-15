import React from "react";
import { formatFileSize } from "@/features/upload/utils";
import { getFileTypeName } from "@/features/upload/constants";

interface FileInfoProps {
    file: File;
}

function FileInfo({ file }: FileInfoProps) {
    // const typeInfo = getFileTypeInfo(file.type);
    const fileSize = formatFileSize(file.size);
    const typeName = getFileTypeName(file.type);

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center justify-start gap-4 text-sm">
                <span className="">{fileSize}</span>

                <span className="text-muted-foreground">{typeName}</span>
            </div>
            {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {typeInfo?.label || 'File'}
            </span> */}
        </div>
    );
}

export default FileInfo;