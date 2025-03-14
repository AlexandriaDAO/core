import { Dispatch, SetStateAction, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
	reset,
	setContentType,
	setFileSelector,
	setPreUploadPreview,
	setStep,
	setTextEditor,
	Step,
} from "@/features/upload/uploadSlice";
import estimateCost from "../thunks/estimateCost";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface UseFileEffectProps {
	file: File | null;
	setUploadedFile: Dispatch<SetStateAction<File | null>>;
}

export function useFileEffect({ file, setUploadedFile }: UseFileEffectProps) {
	const dispatch = useAppDispatch();
	const {type} = useAppSelector(state => state.upload);

	useEffect(() => {
		if (file) {
			const contentType = type;

			setUploadedFile(null);

			dispatch(reset());

			dispatch(setStep(Step.Preview));
			dispatch(setContentType(contentType));
			dispatch(setFileSelector(false));
			dispatch(setTextEditor(false));
			dispatch(setPreUploadPreview(true));

			dispatch(estimateCost({ file }));
		}
	}, [file]);
}
