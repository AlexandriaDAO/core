import { useState } from "react";

interface UseDragDropProps {
	onFileDrop: (file: File) => void;
}

export const useDragDrop = ({ onFileDrop }: UseDragDropProps) => {
	const [drag, setDrag] = useState(0);

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag((prev) => prev + 1);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag((prev) => prev - 1);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag(0);
		const selectedFile = e.dataTransfer.files[0];
		if (selectedFile) {
			onFileDrop(selectedFile);
		}
	};

	return {
		drag,
		handleDragEnter,
		handleDragOver,
		handleDragLeave,
		handleDrop,
	};
};
