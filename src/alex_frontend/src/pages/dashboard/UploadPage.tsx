import React, { Suspense } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/lib/components/button";
import { lazyLoad } from "@/utils/lazyLoad";
import AssetSkeleton from "@/features/upload/components/AssetSkeleton";

// import UploadProvider from "@/providers/UploadProvider";
const UploadProvider = lazyLoad(() => import("@/providers/UploadProvider"));

const UploadBook = lazyLoad(() => import("@/features/upload/book"));
const UploadImage = lazyLoad(() => import("@/features/upload/image"));
const UploadAudio = lazyLoad(() => import("@/features/upload/audio"));
const UploadVideo = lazyLoad(() => import("@/features/upload/video"));

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
					<Suspense fallback={
						<>
							<AssetSkeleton />
							<AssetSkeleton />
							<AssetSkeleton />
							<AssetSkeleton />
						</>
					}>
						<UploadProvider>
							<Suspense fallback={<AssetSkeleton />}>
								<UploadBook />
							</Suspense>
							<Suspense fallback={<AssetSkeleton />}>
								<UploadImage />
							</Suspense>
							<Suspense fallback={<AssetSkeleton />}>
								<UploadAudio />
							</Suspense>
							<Suspense fallback={<AssetSkeleton />}>
								<UploadVideo />
							</Suspense>
						</UploadProvider>
					</Suspense>
				</div>
			</div>
		</>
	);
}

export default UploadPage;