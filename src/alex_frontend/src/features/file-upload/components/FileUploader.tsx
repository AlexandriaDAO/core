import React, { useState } from "react";

const allowedTypes = [
	"image/jpeg", "application/jpeg", "image/jpg", "application/jpg",
	"application/epub+zip", "video/mp4", "image/png", "application/png",
	"image/svg+xml", "application/svg+xml", "image/gif", "application/gif",
	"video/webm", "application/pdf", "text/plain", "text/markdown",
	"audio/mpeg", "audio/ogg", "audio/wav", "application/json", "text/html"
];

interface FileUploaderProps {
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileUploader({ setFile }: FileUploaderProps) {
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);


	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		setError(null);

		if (selectedFile) {
			if (!allowedTypes.includes(selectedFile.type)) {
				setError(`File type ${selectedFile.type} is not allowed. Please select a supported file type.`);
				setFile(null);
				e.target.value = '';
				return;
			}
			setFile(selectedFile);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const droppedFile = e.dataTransfer.files[0];

		if (droppedFile) {
			if (!allowedTypes.includes(droppedFile.type)) {
				setError(`File type ${droppedFile.type} is not allowed. Please select a supported file type.`);
				setFile(null);
				return;
			}
			setFile(droppedFile);
		}
	};


	return (
        <>
            <div className="mb-6 text-gray-600">Choose a file to upload</div>

            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept={allowedTypes.join(',')}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <svg
                            className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-sm text-gray-500">
                        Supported file types: Images, PDFs, Videos, and more
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}
        </>
	);
}

export default FileUploader;
