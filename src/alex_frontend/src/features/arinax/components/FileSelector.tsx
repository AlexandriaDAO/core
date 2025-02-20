import React, { useState } from "react";
import { FILE_TYPES, allowedTypes, getFileTypeInfo } from "../constants";
import { formatFileSize } from "../utils";
import { XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTextMode } from "../arinaxSlice";

interface FileSelectorProps {
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileSelector({ setFile }: FileSelectorProps) {
    const dispatch = useAppDispatch();
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [showSupportedTypes, setShowSupportedTypes] = useState(false);

	const validateFile = (file: File): string | null => {
		const typeInfo = getFileTypeInfo(file.type);

		if (!typeInfo) {
			setShowSupportedTypes(true);
			return `File type is not supported.`;
		}

		if (file.size > typeInfo.maxSize) {
			setShowSupportedTypes(false);
			return `File size exceeds ${formatFileSize(typeInfo.maxSize)} limit for ${typeInfo.label.toLowerCase()}. Please select a smaller file.`;
		}

		setShowSupportedTypes(false);
		return null;
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		setError(null);

		if (selectedFile) {
			const validationError = validateFile(selectedFile);
			if (validationError) {
				setError(validationError);
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
			const validationError = validateFile(droppedFile);
			if (validationError) {
				setError(validationError);
				setFile(null);
				return;
			}
			setFile(droppedFile);
		}
	};


	return (
        <div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-8 border border-border">
            <div className="space-y-4">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">Upload File</h2>
                    <p className="text-gray-600">
                        Choose a file to upload or <span className="cursor-pointer text-info hover:underline" onClick={() => dispatch(setTextMode(true))}>create your own text here.</span>
                    </p>
                </div>

                <div
                    className={`relative border-2 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                            ? 'border-border border-solid bg-secondary'
                            : 'border-gray-300 border-dashed hover:border-gray-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        // accept=""
                        accept={[...allowedTypes, ".md"].join(',')}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <svg
                                className={`w-16 h-16 ${isDragging ? 'text-primary' : 'text-gray-400'}`}
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

                        {/* File Type Categories */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {Object.entries(FILE_TYPES).map(([key, category]) => (
                                <div key={key} className="text-center p-3 bg-white dark:bg-transparent border rounded">
                                    <div className="text-2xl mb-2">{category.icon}</div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-white">{category.label}</div>
                                    <div className="text-xs text-gray-500">
                                        Up to {formatFileSize(category.maxSize)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 space-y-4">
                        {/* Error Message with Chevron */}
                        <div className="p-4 bg-white dark:bg-gray-300 text-destructive rounded-lg border border-destructive">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1">
                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="flex-1">{error}</span>
                                </div>
                                <button
                                    onClick={() => setShowSupportedTypes(!showSupportedTypes)}
                                    className="ml-4 p-1 hover:bg-red-100 rounded-full transition-colors"
                                    title={showSupportedTypes ? "Hide supported types" : "Show supported types"}
                                >
                                    {showSupportedTypes ? (
                                        <ChevronUp className="w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                showSupportedTypes ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="p-4 rounded-lg border">
                                <h3 className="text-sm font-medium mb-3">
                                    Supported file types:
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(FILE_TYPES).map(([key, category]) => (
                                        <div key={key} className="border bg-white dark:bg-transparent p-3 rounded shadow-sm">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-xl">{category.icon}</span>
                                                <span className="font-medium text-gray-700 dark:text-white">
                                                    {category.label}
                                                </span>
                                            </div>
                                            <div className="text-xs space-y-1">
                                                <p className="text-gray-500">Max size: {formatFileSize(category.maxSize)}</p>
                                                <div className="text-gray-500">
                                                    Formats:
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {category.types.map(type => (
                                                            <span 
                                                                key={type}
                                                                className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs"
                                                            >
                                                                {type.split('/')[1].toUpperCase()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
	);
}

export default FileSelector;
