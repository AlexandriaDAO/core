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
            <h2 className="text-lg font-semibold text-gray-700">Selected File</h2>

            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                        <span className="text-2xl">{typeInfo?.icon || '📁'}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                {file.name}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {typeInfo?.label || 'File'}
                            </span>
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="font-mono">{file.type}</span>
                        </div>
                        
                        {typeInfo && (
                            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full"
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