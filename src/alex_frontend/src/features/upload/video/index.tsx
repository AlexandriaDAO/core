import React from "react";
import { LoaderCircle, Video } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/lib/components/dialog";
import MetaData from "./steps/MetaData";
import Asset from "./steps/Asset";
import Process from "./steps/Process";
import { StepProps } from "antd";
import { DialogDescription, DialogTitle } from "@/lib/components/dialog";
import SelectNode from "../common/SelectNode";
import Cover from "../common/Cover";
import HeaderSteps from "../components/HeaderSteps";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setOpen } from "../uploadSlice";
import { AssetType } from "../uploadSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

const UploadVideo = () => {
	const dispatch = useAppDispatch();
	const { screen, loading, error, open } = useAppSelector(state=>state.upload);

	const items:StepProps[] = [
		{ title: "Node" },
		{ title: "Asset" , icon: loading && screen == 1 && <LoaderCircle size={26} className="text-info animate animate-spin"/>},
		{ title: "Cover" , icon: loading && screen == 2 && <LoaderCircle size={26} className="text-info animate animate-spin"/>},
		{ title: "Metadata" , icon: loading && screen == 3 && <LoaderCircle size={26} className="text-info animate animate-spin"/>},
		{ title: "Process" , icon: loading && screen == 4 && <LoaderCircle size={26} className="text-info animate animate-spin"/>,
		status: screen === 4 && error ? 'error' : undefined },
	]

	return (
		<Dialog open={open == AssetType.Video}>
			<DialogTrigger asChild>
				<div onClick={()=>dispatch(setOpen(AssetType.Video))} className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-gray-50 rounded-lg p-6 basis-60">
					<div className="flex flex-col items-center space-y-4">
						<div className="flex flex-col items-center space-y-4">
							<div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
								<Video size={24} className="text-red-600" />
							</div>
							<h3 className="font-semibold text-lg">Video</h3>
							<p className="text-sm text-gray-600 text-center">Upload video content</p>
						</div>
					</div>
				</div>
			</DialogTrigger>

			<DialogContent closeIcon={null} className="sm:max-w-2xl flex flex-col gap-6 border-none focus:border-none focus-visible:border-none outline-none" onOpenAutoFocus={(e) => e.preventDefault()}>
				<header className="">
					<DialogTitle>Video Uploader</DialogTitle>
					<DialogDescription >Perform below steps to upload</DialogDescription>
				</header>
				<HeaderSteps screen={screen} items={items} />

				{/* select a node to use for uploading */}
				{screen == 0 && <SelectNode />}

				{/* Asset upload screen */}
				{screen == 1 && <Asset/>}

				{/* Cover upload screen */}
				{screen == 2 && <Cover />}

				{/* add/edit asset's metadata */}
				{screen == 3 && <MetaData/>}

				{/* display various uploading/processing states */}
				{screen >= 4 && <Process />}

			</DialogContent>
		</Dialog>
	);
};

export default UploadVideo;