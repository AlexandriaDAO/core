import { useRef, useState } from "react";

interface UseFileUploadProps {
	onFileSelect: (file: File) => void;
	acceptedFileTypes?: string;
}

export const useFileUpload = ({
	onFileSelect,
	acceptedFileTypes = "*",
}: UseFileUploadProps) => {
	const hiddenFileInput = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | undefined>(undefined);

	const handleHiddenInputClick = () => {
		if (hiddenFileInput.current) {
			hiddenFileInput.current.click();
		}
	};

	const handleDeleteFile = () => {
		if (hiddenFileInput.current) hiddenFileInput.current.value = "";
		setFile(undefined);
		onFileSelect(undefined as any);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			// Validate file type
			if (!selectedFile.type.match(acceptedFileTypes)) {
				// You might want to add toast notification here
				return;
			}
			setFile(selectedFile);
			onFileSelect(selectedFile);
		}
	};

	return {
		file,
        setFile,
		hiddenFileInput,
		handleHiddenInputClick,
		handleDeleteFile,
		handleFileChange,
	};
};
