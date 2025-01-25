import React from "react";
import { XCircle } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface UploadErrorProps {
	file: File;
}

const UploadError: React.FC<UploadErrorProps> = ({
	file,
}) => {
	const {uploadError} = useAppSelector(state=>state.fileUpload);
	return (
		<div className="bg-white rounded-lg shadow-md">
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<XCircle
							className="w-6 h-6 text-red-500"
							strokeWidth={2}
						/>
						<div>
							<h3 className="text-lg font-medium text-gray-900">
								Upload Failed
							</h3>
							<p className="text-sm text-gray-500">{file.name}</p>
						</div>
					</div>
					<p className="text-sm text-gray-500">{uploadError}</p>
				</div>
			</div>
		</div>
	);
};

export default UploadError;