import React, { useState } from "react";
import { FILE_TYPES, allowedTypes, getFileTypeInfo } from "@/features/upload/constants";
import { formatFileSize } from "@/features/upload/utils";
import { ChevronDown, ChevronUp, CircleAlert } from "lucide-react";
import { setFileSelector } from "../uploadSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";

interface FileSelectorProps {
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function FileSelector({ setFile }: FileSelectorProps) {
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
    const { fileSelector } = useAppSelector(state => state.upload);
    const dispatch = useAppDispatch();

	const validateFile = (file: File): string | null => {
		const typeInfo = getFileTypeInfo(file.type);

		if (!typeInfo) {
			return `File type is not supported.`;
		}

		if (file.size > typeInfo.maxSize) {
			return `File size exceeds ${formatFileSize(typeInfo.maxSize)} limit for ${typeInfo.label.toLowerCase()}. Please select a smaller file.`;
		}

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
        <div className="w-full font-roboto-condensed space-y-1">
            <button
                onClick={() => dispatch(setFileSelector(!fileSelector))}
                className="w-full font-syne text-xl flex items-center justify-between group"
            >
                <h2 className="text-xl font-semibold text-primary group-hover:text-primary/70">Select a File to Upload</h2>
                <span className="text-sm text-primary group-hover:text-primary/70">
                    {fileSelector ? (
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

            {fileSelector && (
                <div
                    className={`relative border-2 rounded-lg py-8 px-4 sm:px-6 md:px-8 text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                            ? 'border-border border-solid bg-secondary'
                            : error
                                ? 'border-destructive/50 border-dashed hover:border-destructive'
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

                        <div className="text-gray-600">
                            Drag and drop your asset here
                        </div>
                        <div className="text-gray-600">
                            or
                        </div>
                        <Button variant="outline" rounded="full" className="bg-white">
                            Select file
                        </Button>

                        {/* File Type Categories */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {Object.entries(FILE_TYPES).map(([key, category]) => (
                                <div key={key} className="flex flex-col items-start justify-center gap-2 p-3 bg-white dark:bg-transparent border rounded">
                                    <div className="text-sm text-muted-foreground dark:text-white">{category.label}</div>
                                    <div className="w-full flex flex-col items-center justify-center gap-2 p-2 bg-card border border-border rounded">
                                        <div className="text-2xl">{category.icon}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Up to {formatFileSize(category.maxSize)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <Alert variant="danger" title={error} icon={CircleAlert} className="text-left border-none border-l-2 border-l-destructive">
                                <h3 className="text-sm text-foreground my-4">Supported file types:</h3>
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(FILE_TYPES).map(([key, category]) => (
                                        <div key={key}>
                                            <span className="text-primary dark:text-white">
                                                {category.label}
                                            </span>
                                            <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                                                {category.types.map(type => (
                                                    <span 
                                                        key={type}
                                                        className="inline-flex items-center text-xs"
                                                    >
                                                        {type.split('/')[1].toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Alert>
                        )}
                    </div>
                </div>
            )}
        </div>
	);
}

export default FileSelector;
