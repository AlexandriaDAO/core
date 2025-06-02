import React, { Dispatch, SetStateAction, useEffect } from "react";

interface UseTransactionEffectProps {
	transaction: string | null;
	file: File | null;
	setUploadedFile: Dispatch<SetStateAction<File | null>>;
}

export function useTransactionEffect({
	transaction,
	file,
	setUploadedFile,
}: UseTransactionEffectProps) {
	useEffect(() => {
		if (transaction) {
			setUploadedFile(file);
		}
	}, [transaction]);
}
