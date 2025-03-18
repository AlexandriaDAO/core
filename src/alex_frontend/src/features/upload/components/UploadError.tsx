import React from "react";
import { TriangleAlert } from "lucide-react";
import { Alert } from "@/components/Alert";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const UploadError: React.FC = () => {
	const { uploadError, fetchError, selectError, scanError } = useAppSelector(state => state.upload);

	let title = "Error!!";
	if (scanError) {
		title = "Content Error";
	} else if (fetchError) {
		title = "Error while fetching wallets";
	} else if (selectError) {
		title = "Error while selecting a wallet";
	} else if (uploadError) {
		title = "Error while uploading the file";
	}
	const message = scanError || uploadError || fetchError || selectError || "Unknown Error";

	return (
		<Alert variant="danger" title={title} icon={TriangleAlert} className="w-full text-left border-none border-l-2 border-l-destructive">
			{message}
		</Alert>
	)
};

export default UploadError;