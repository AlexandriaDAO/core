import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, BookOpen, Headphones, Image, Video } from "lucide-react";
import { Button } from "@/lib/components/button";
import UploadBook from "@/features/upload-book";

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
				<div className="grid grid-cols-2 gap-6">
					<UploadBook />

					<div className="group cursor-not-allowed hover:shadow-lg transition-shadow duration-300 bg-gray-50 rounded-lg p-6">
						<div className="flex flex-col items-center space-y-4">
							<div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
								<Headphones size={24} className="text-purple-600" />
							</div>
							<h3 className="font-semibold text-lg">Audio</h3>
							<p className="text-sm text-gray-600 text-center">Upload audio files and podcasts</p>
						</div>
					</div>

					<div className="group cursor-not-allowed hover:shadow-lg transition-shadow duration-300 bg-gray-50 rounded-lg p-6">
						<div className="flex flex-col items-center space-y-4">
							<div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
								<Video size={24} className="text-red-600" />
							</div>
							<h3 className="font-semibold text-lg">Video</h3>
							<p className="text-sm text-gray-600 text-center">Upload video content</p>
						</div>
					</div>

					<div className="group cursor-not-allowed hover:shadow-lg transition-shadow duration-300 bg-gray-50 rounded-lg p-6">
						<div className="flex flex-col items-center space-y-4">
							<div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
								<Image size={24} className="text-green-600" />
							</div>
							<h3 className="font-semibold text-lg">Image</h3>
							<p className="text-sm text-gray-600 text-center">Upload images and graphics</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default UploadPage;