import React from "react";
import { XCircle } from "lucide-react";

interface UploadErrorProps {
	file: File | null;
	error: string | null;
}

const UploadError: React.FC<UploadErrorProps> = ({ file, error = "Unknown Error" }) => {
	return (
		<div className="bg-secondary rounded-lg shadow-md">
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<XCircle
							className="w-6 h-6 text-destructive"
							strokeWidth={2}
						/>
						<div>
							<h3 className="text-lg font-medium text-info">
								Upload Failed
							</h3>
							<p className="text-sm text-gray-500">{file?.name || 'An unknown error occurred'}</p>
						</div>
					</div>
					<p className="text-sm text-info">{error}</p>
				</div>
			</div>
		</div>
	);
};

export default UploadError;