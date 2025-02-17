import React from "react";
import { formatFileSize } from "../utils";
import { getFileTypeInfo } from "../constants";

interface FilePreviewProps {
    file: File | null;
}

function FilePreview({ file }: FilePreviewProps) {
    if (!file) return null;

    const typeInfo = getFileTypeInfo(file.type);

    return (
        <div>
            <h2 className="text-lg font-semibold">Selected File</h2>

            <div className="p-6 bg-secondary rounded shadow-sm border">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center border rounded bg-white dark:bg-transparent">
                        <span className="text-2xl">{typeInfo?.icon || '📁'}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium truncate">
                                {file.name}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                                {typeInfo?.label || 'File'}
                            </span>
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="font-mono">{file.type}</span>
                        </div>
                        
                        {typeInfo && (
                            <div className="mt-2 h-1 bg-gray-300 dark:bg-gray-500 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gray-700 dark:bg-info/50 rounded-full"
                                    style={{ 
                                        width: `${Math.min((file.size / typeInfo.maxSize) * 100, 100)}%`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FilePreview;