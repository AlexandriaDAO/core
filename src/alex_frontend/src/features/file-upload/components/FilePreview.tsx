import React from "react";


interface FilePreviewProps {
    file: File | null;
}

function FilePreview({ file }: FilePreviewProps) {
    if (!file) return null;
	return (
        <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Selected File</h2>
            <p className="text-blue-600">{file.name}</p>
        </div>
	);
}

export default FilePreview;
