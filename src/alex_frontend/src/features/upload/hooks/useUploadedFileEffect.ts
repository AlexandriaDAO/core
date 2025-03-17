import { Dispatch, SetStateAction, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
	setFileSelector,
	setPostUploadPreview,
	setStep,
	Step,
} from "@/features/upload/uploadSlice";

interface UseUploadedFileEffectProps {
	uploadedFile: File | null;
	setFile: Dispatch<SetStateAction<File | null>>;
}

export function useUploadedFileEffect({
	uploadedFile,
	setFile,
}: UseUploadedFileEffectProps) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (uploadedFile) {
			setFile(null);
			dispatch(setStep(Step.Success));
			dispatch(setPostUploadPreview(true));
			dispatch(setFileSelector(true));
		}
	}, [uploadedFile]);
}
