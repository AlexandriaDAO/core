import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/lib/components/button";
import { UploadAudio, UploadBook, UploadImage, UploadVideo } from "@/features/upload";
import UploadProvider from "@/providers/UploadProvider";

function UploadPage() {
	const navigate = useNavigate();

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Upload Assets</h1>
				<Button onClick={()=>navigate(-1)} variant="link" rounded="full" scale="icon" className="p-2">
					<ArrowLeft size={20}/>
				</Button>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">Choose an asset type to upload</div>
				<div className="flex gap-6 justify-center flex-wrap">
					<UploadProvider>
						<UploadBook />
						<UploadImage />
						<UploadAudio />
						<UploadVideo />
					</UploadProvider>
				</div>
			</div>
		</>
	);
}

export default UploadPage;